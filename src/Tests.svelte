<script>
    import { Route } from "svelte-navigator";
    import { Connected } from "./stores";

    import TXT from "./i18n/ua";

    import Article from "./components/Article.svelte";
    import Message from "./components/Message.svelte";

    import Breadcrumbs from "./components/Breadcrumbs.svelte";
    import PunctList from "./components/PunctList.svelte";
    import Quiz from "./components/Quiz.svelte";
</script>

<Article>
    <Breadcrumbs />

    {#if $Connected}
        <Message bg="#ffffff">
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
