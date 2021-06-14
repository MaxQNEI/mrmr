<script>
    import { onMount, onDestroy } from "svelte";
    import { Socket } from "../stores";

    import TXT from "../i18n/ua";

    export let list;
    export let index;
    export let question;
    export let onAnswerSelect = () => {};
    export let onShowReply = () => {};
    export let isCurrent = false;
    export let isComplete = false;

    let Stats = {
        Correct: 0,
        Incorrect: 0,
    };

    onMount(() => {
        $Socket.on(`set-question-stats-${question.UUID}`, (stats) => {
            console.debug(">>>", stats);
            Stats = { ...Stats, ...stats };
            Stats.CorrectPercent = Stats.Correct / (Stats.Correct + Stats.Incorrect);
            Stats.IncorrectPercent = 1 - Stats.CorrectPercent;
        });
        $Socket.emit(`get-question-stats`, question.UUID);
    });

    onDestroy(() => {
        $Socket.off(`set-question-stats-${question.UUID}`);
    });
</script>

<div class="question" class:with-pincture={question.Picture}>
    {#if question.Picture}
        <div class="question-picture">
            <div>
                <img src={question.Picture} alt="" />
            </div>
        </div>
    {:else}
        <div class="question-no-picture">
            <span>{TXT.QuestionWithoutPicture}</span>
        </div>
    {/if}

    <div class="answer-list">
        <h3 class="question-text">{question.Text}</h3>

        {#each question.AnswerList as Answer}
            {#if isComplete}
                <button
                    class="answer-item"
                    class:correct={Answer.isCorrect !== undefined && Answer.isCorrect}
                    class:incorrect={Answer.isCorrect !== undefined && !Answer.isCorrect}
                    disabled
                >
                    {Answer.Text}
                </button>
            {:else}
                <button class="answer-item" on:click={onAnswerSelect.bind(null, Answer)}>
                    {Answer.Text}
                </button>
            {/if}
        {/each}

        {#if question.Reply}
            <div class="reply-block">
                <div class="btn-show-reply" on:click={onShowReply.bind(null, question)} />

                {#if question.showReply}
                    <div>{question.Reply}</div>
                {/if}
            </div>
        {/if}
    </div>

    <div class="info">
        <span>{TXT.Question}: {index + 1} / {list.length}</span>
        {#if isComplete}
            <span>|</span>
            <span>
                {TXT.AnswerStatistics}: <span class="info-correct">{Stats.Correct}</span>
                (<span class="info-correct">{(Stats.CorrectPercent * 100).toFixed(2)}%</span>)
                <span>~</span>
                <span class="info-incorrect">{Stats.Incorrect}</span>
                (<span class="info-incorrect">{(Stats.IncorrectPercent * 100).toFixed(2)}%</span>)
            </span>
        {/if}
    </div>

    <div class="stats" class:nd={(!Stats.Correct && !Stats.Incorrect) || !isComplete}>
        <div class="stats-correct" style="flex: {Stats.Correct};" />
        <div class="stats-incorrect" style="flex: {Stats.Incorrect};" />
    </div>
</div>

<style>
    .question {
        position: relative;

        display: grid;
        grid-gap: 16px;
        grid-template-columns: 1fr 1fr;
        justify-content: center;
        align-items: center;

        padding: 24px 24px 32px;
        border: 1px solid #dddddd;
        background-color: #ffffff;
    }

    .answer-list {
        display: grid;
        grid-gap: 8px;
    }

    .question-text {
        padding: 8px 16px;
        text-align: center;
    }

    .question-picture {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .question-picture img {
        max-height: 60vh;
        opacity: 1;
    }

    .question-no-picture {
        text-align: center;
        color: #666666;
    }
    .question-no-picture > span {
        max-width: 200px;
    }

    .answer-item {
        border: 1px solid transparent;
        background-color: #f2f2f2;
        text-align: left;
        color: #222222;
    }
    .answer-item.correct {
        background-color: yellowgreen;
    }
    .answer-item.incorrect {
        background-color: tomato;
    }

    .reply-block {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(0, max-content));
        grid-gap: 8px;
    }

    .btn-show-reply {
        width: 32px;
        height: 32px;
        background: center / contain no-repeat url("/static/information-sign-dodgerblue.svg");
        cursor: pointer;
    }
    .btn-show-reply:hover {
        opacity: 0.8;
    }

    .info {
        position: absolute;
        left: 10px;
        bottom: 6px;
    }
    .info-correct {
        color: yellowgreen;
    }
    .info-incorrect {
        color: tomato;
    }

    .stats {
        position: absolute;
        left: 5%;
        right: 5%;
        bottom: -8px;
        height: 8px;
        border: 0;
        border-radius: 0 0 4px 4px;
        background-color: #ffffff;
        overflow: hidden;

        display: flex;
    }
    .stats-correct {
        background-color: yellowgreen;
    }
    .stats-incorrect {
        background-color: tomato;
    }
    .stats.nd {
        border-top: 1px solid #dfdfdf;
    }
    .stats.nd .stats-correct,
    .stats.nd .stats-incorrect {
        opacity: 0;
    }

    @media (max-width: 480px) {
        .question {
            grid-template-columns: 1fr;
        }
    }
</style>
