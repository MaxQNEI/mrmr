<script>
    import { Route } from "svelte-navigator";
    import { Socket, Connected } from "./stores";
    import { BreadcrumbsItems } from "./stores";

    // import { onMount } from "svelte";

    import TXT from "./i18n/ua";

    import Article from "./components/Article.svelte";
    import Message from "./components/Message.svelte";

    import Breadcrumbs from "./components/Breadcrumbs.svelte";
    import PunctList from "./components/PunctList.svelte";
    import Quiz from "./components/Quiz.svelte";
    // import QuestionItem from "./components/QuestionItem.svelte";

    // const RandomCount = 1;

    // const HourMS = 60 * 60 * 1e3;
    // const MinuteMS = 60 * 1e3;
    // const SecondMS = 1e3;

    // let Connected = false;
    // let NetworkOpen = false;
    // $Socket.on("connect", () => (Connected = true));
    // $Socket.on("disconnect", () => {
    //     Connected = false;
    //     NetworkInfo = null;
    // });

    // let NetworkInfo = null;
    // $Socket.on("network", (info) => {
    //     NetworkInfo = info;
    // });

    // let Quiz = null;

    // let PunctList = [];
    // let CurrentPunct = null;
    // let QuestionList = [];
    // let QuestionIndex = null;
    // let Question = null;
    // let Complete = false;

    // function Reset() {
    //     PunctList = [];
    //     CurrentPunct = null;
    //     QuestionList = [];
    //     QuestionIndex = null;
    //     Question = null;
    //     Question = false;
    // }

    // function GotoPunctList() {
    //     Reset();
    //     $Socket.once("set-punct-list", (puncts) => (PunctList = puncts));
    //     $Socket.emit("get-punct-list");
    // }

    // function StartQuizPunct(punct) {
    //     CurrentPunct = punct;
    //     Quiz = null;

    //     $Socket.once("set-question-list", (list) => {
    //         QuestionList = list;
    //         QuestionIndex = 0;
    //         Question = QuestionList[QuestionIndex];
    //         Complete = false;
    //         Quiz = {
    //             Type: "Punct",
    //             Start: Date.now(),
    //         };
    //     });
    //     $Socket.emit("get-question-list-by-punct", CurrentPunct.UUID);

    //     Participate();
    // }

    // function StartQuizRandom(count = RandomCount) {
    //     Quiz = null;

    //     $Socket.once("set-question-list", (list) => {
    //         CurrentPunct = { Title: TXT.NRandomQuestions.replace(/\%count\%/, list.length) };
    //         QuestionList = list;
    //         QuestionIndex = 0;
    //         Question = QuestionList[QuestionIndex];
    //         Complete = false;
    //         Quiz = {
    //             Type: "Random",
    //             Start: Date.now(),
    //             End: Date.now() + list.length * 2 * 60 * 1000,
    //         };
    //     });
    //     $Socket.emit("get-question-list", { count });

    //     Logout();
    // }

    // function Restart() {
    //     if (!Quiz || !Quiz.Type) {
    //         return;
    //     }

    //     QuestionIndex = 0;
    //     Question = QuestionList[QuestionIndex];
    //     Complete = false;
    //     Quiz = { ...Quiz, Start: Date.now() };

    //     Quiz.Type === "Random" && (Quiz = { ...Quiz, End: Date.now() + QuestionList.length * 2 * 60 * 1000 });
    // }

    // function CurrentPunctTitle() {
    //     return ((CurrentPunct.Punct ? "&sect; " + CurrentPunct.Punct : "") + " " + CurrentPunct.Title).trim();
    // }

    // $: Question && console.debug(Question.AnswerList);
    // $: console.debug(QuestionList);
</script>

<Article>
    <Breadcrumbs />

    {#if $Connected}
        <!-- <div class="action">
            <button on:click={StartQuizRandom.bind(null, RandomCount)}>
                {@html TXT.NRandomQuestions.replace(/\%count\%/, RandomCount)}
            </button>
        </div> -->

        <Message bg="#e2e2e2">
            <Article>
                <p style="font-size: larger;">{@html TXT.Information}:</p>
                <p>{@html TXT.TestsText[0]}</p>
            </Article>
        </Message>

        <Route>
            <PunctList />
        </Route>

        <Route path="/:Punct" let:params>
            <Quiz Punct={params.Punct} />
        </Route>
    {/if}
</Article>

<style>
</style>
