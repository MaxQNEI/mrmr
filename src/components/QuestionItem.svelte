<script>
    export let TXT;
    export let list;
    export let index;
    export let question;
    export let onSelect = () => {};
    export let onShowReply;
    export let complete = false;
</script>

<div class={"question" + (question.Picture ? " with-picture" : "")}>
    <div class="info">
        {TXT.Question}: {index + 1} / {list.length}
    </div>

    {#if question.Picture}
        <div class="question-picture">
            <img src={question.Picture} alt="" />
        </div>
    {:else}
        <div class="question-no-picture">
            <span>{TXT.QuestionWithoutPicture}</span>
        </div>
    {/if}

    <div class="question-answer-list">
        <h3 class="question-text">{question.Text}</h3>

        {#each question.AnswerList as Answer}
            {#if complete}
                <button
                    class={"question-answer-item" +
                        (Answer.isCorrect !== undefined ? (Answer.isCorrect ? " correct" : " incorrect") : "")}
                    disabled
                >
                    {Answer.Text}
                </button>
            {:else}
                <button class="question-answer-item" on:click={onSelect.bind(null, Answer)}>
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
        box-shadow: 0 0 16px #999999;
    }

    .info {
        position: absolute;
        left: 10px;
        bottom: 6px;
    }

    .question-answer-list {
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
    }

    .question-no-picture {
        text-align: center;
        color: #666666;
    }
    .question-no-picture > span {
        max-width: 200px;
    }

    .question-answer-item {
        box-shadow: 0 0 3px #999999;
        background-color: transparent;
        text-align: left;
        color: #222222;
    }
    .question-answer-item.correct {
        background-color: yellowgreen;
    }
    .question-answer-item.incorrect {
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

    @media (max-width: 480px) {
        .question {
            grid-template-columns: 1fr;
        }
    }
</style>
