<script>
    import { onMount } from "svelte";
    // import { navigate } from "svelte-navigator";
    import { Socket, Connected } from "../stores";
    import { BreadcrumbsItems } from "../stores";
    import TXT from "../i18n/ua";

    import QuestionItem from "./QuestionItem.svelte";

    export let Punct;

    const HourMS = 60 * 60 * 1e3;
    const MinuteMS = 60 * 1e3;
    const SecondMS = 1e3;

    let Quiz = {
        type: null,
        complete: false,
        start: null,
        end: null,
        spent: null,
        left: null,
    };

    let Question = {
        list: [],
        index: 0,
        current: null,
    };

    let Result = {};

    onMount(() => {
        UpdBreadcrumbs();
        GetQuestions();
    });

    onMount(() => {
        const render = (/* timestamp */) => {
            window.requestAnimationFrame(render);

            if (Quiz.complete) {
                return;
            }

            if (Quiz) {
                Quiz.start && (Quiz.spent = TimeSpent(Quiz.start));
                Quiz.end && (Quiz.left = TimeLeft(Quiz.end));
            }
        };
        window.requestAnimationFrame(render);
    });

    function UpdBreadcrumbs() {
        $Socket.once("set-punct-info", (punct) => {
            $BreadcrumbsItems = [
                {
                    html: TXT.Tests,
                    to: "/tests",
                },
                {
                    html: `&sect; ${punct.Punct} ${punct.Title}`,
                    onClick: () => GetQuestions(),
                },
            ];
        });
        $Socket.emit("get-punct-info", { Punct });
    }

    function GetQuestions() {
        let Type = "All";
        let Key;
        if (Punct) {
            Type = "Punct";
            Key = Punct;
        }

        SetQuestionList([]);

        $Socket.once("set-question-list", (list) => {
            SetQuestionList(list);
            SelectQuestion(0);
            Quiz = { type: Type, complete: false, start: Date.now() };
        });
        $Socket.emit("get-question-list", { type: Type, key: Key });
    }

    function SetQuestionList(list) {
        Question.list = list;
    }

    function SelectQuestion(index) {
        Question.index = index;
        Question.current = Question.list[Question.index];
        Quiz.complete = !Question.current;
    }

    function NextQuestion() {
        Question.index++;
        Question.current = Question.list[Question.index];
        Quiz.complete = !Question.current;
    }

    function onAnswerSelect(answer) {
        if (answer.isCorrect !== undefined) {
            return;
        }

        $Socket.once("set-answer-correct", (correctUUID, incorrectUUID) => {
            Question.current.AnswerList = Question.current.AnswerList.map((_answer) => {
                _answer.UUID === correctUUID && (_answer.isCorrect = true);
                answer.UUID === _answer.UUID && _answer.UUID === incorrectUUID && (_answer.isCorrect = false);
                return _answer;
            });

            Question.current.isCorrect = answer.UUID === correctUUID;

            incorrectUUID && (Question.current.showReply = true);
            NextQuestion();
        });
        $Socket.emit("get-answer-correct", Question.current.UUID, answer.UUID);
    }

    function onShowReply(question) {
        Question.list = Question.list.map((_question) => {
            if (_question.UUID === question.UUID) {
                _question.showReply = true;
            }
            return _question;
        });
    }

    function TimeSpent(time, format = "h:m:s") {
        time = Date.now() - time;

        let h, m, s;

        time -= h = Math.floor(time / HourMS);
        time -= m = Math.floor(time / MinuteMS);
        time -= s = Math.floor(time / SecondMS);

        return format
            .replace(/h/g, h.toString().padStart(2, "0"))
            .replace(/m/g, m.toString().padStart(2, "0"))
            .replace(/s/g, s.toString().padStart(2, "0"));
    }

    function TimeLeft(endTime, format = "h:m:s") {
        endTime = endTime - Date.now();

        let h, m, s;

        endTime -= (h = Math.max(0, Math.floor(endTime / HourMS))) * HourMS;
        endTime -= (m = Math.max(0, Math.floor(endTime / MinuteMS))) * MinuteMS;
        endTime -= (s = Math.max(0, Math.floor(endTime / SecondMS))) * SecondMS;

        return format
            .replace(/h/g, h.toString().padStart(2, "0"))
            .replace(/m/g, m.toString().padStart(2, "0"))
            .replace(/s/g, s.toString().padStart(2, "0"));
    }

    $: if (Quiz.complete) {
        Result = {
            spent: Quiz.spent,
            total: Question.list.length,
            correct: Question.list.filter((q) => q.isCorrect).length,
        };

        Result.incorrect = Result.total - Result.correct;
        Result.percent = Math.round((Result.correct / Result.total) * 100);
    }
</script>

<div class="question-wrap">
    <div class="question-list">
        {#each Question.list.slice(0, Question.index) as question, i}
            <QuestionItem {TXT} index={i} list={Question.list} {question} {onShowReply} complete={true} />
        {/each}

        {#if !Quiz.complete && Question.current}
            <QuestionItem
                {TXT}
                index={Question.index}
                list={Question.list}
                question={Question.current}
                onSelect={onAnswerSelect}
                {onShowReply}
            />
        {:else if Quiz.complete}
            <div class="complete">
                <div>
                    {#if Result.incorrect < 2}
                        <img src="/static/checked-yellowgreen.svg" alt="" />
                    {:else}
                        <img src="/static/close-tomato.svg" alt="" />
                    {/if}
                </div>

                <div>
                    <p>{TXT.TotalQuestions}: <b>{Result.total}</b></p>
                    <p>{TXT.CorrectQuestions}: <b>{Result.correct}</b> (<b>{Result.percent}%</b>)</p>
                    <p>{TXT.TimeSpent}: <b>{Quiz.spent}</b></p>
                </div>
            </div>
        {/if}
    </div>
</div>

{#if Quiz}
    <div class={`float-status${Quiz ? " show" : ""}`}>
        {#if Quiz}
            <div>
                {[
                    Quiz.left ? `${TXT.WatchLeft}: ${Quiz.left}` : null,
                    Quiz.spent ? `${TXT.WatchSpent}: ${Quiz.spent}` : null,
                ]
                    .filter((v) => v)
                    .join(" / ")}

                <!-- | -->
                <!-- <button class="link" on:click={Restart}>{TXT.Restart}</button> -->
            </div>
        {:else}
            &nbsp;
        {/if}
    </div>
{/if}

<style>
    .question-wrap {
        padding: 4px 0;
    }

    .question-list {
        display: grid;
        grid-gap: 32px;
        padding: 16px 0;
    }

    .complete {
        display: grid;
        grid-auto-flow: column;
        grid-gap: 48px;
        justify-content: center;
        align-items: center;
        padding: 16px;
        box-shadow: 0 0 5px #999999;
        background-color: #ffffff;
    }
    .complete img {
        width: 100px;
        max-width: 100px;
    }

    .float-status {
        position: fixed;
        z-index: 10;
        bottom: 50px;
        padding: 8px 16px;
        box-shadow: 0 0 5px #999999;
        background-color: #ffffff;

        transition-duration: 1000ms;
    }

    .float-status.show {
        bottom: 0px;
    }
</style>
