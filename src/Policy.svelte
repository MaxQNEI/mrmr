<script>
    import { Route, useNavigate } from "svelte-navigator";
    import Privacy from "./components/Policy/Privacy.svelte";
    import TermsOfUse from "./components/Policy/TermsOfUse.svelte";
    import Article from "./components/Article.svelte";

    const navigate = useNavigate();

    import TXT from "./i18n/ua";
</script>

<Route>
    <Article>
        <h2>{TXT.Policy}</h2>

        <button class="link" on:click={() => navigate("privacy")}>
            <span class="larger">{TXT.PolicyPrivacy}</span>
        </button>

        <button class="link" on:click={() => navigate("terms-of-use")}>
            <span class="larger">{TXT.PolicyTermsOfUse}</span>
        </button>
    </Article>
</Route>

<Route path="/privacy">
    <h2>
        <button class="link" on:click={() => navigate("/policy")}>{TXT.Policy}</button> / {TXT.PolicyPrivacy}
    </h2>

    <div class="content">
        <Privacy />
    </div>
</Route>

<Route path="/terms-of-use">
    <h2>
        <button class="link" on:click={() => navigate("/policy")}>{TXT.Policy}</button> / {TXT.PolicyTermsOfUse}
    </h2>

    <div class="content">
        <TermsOfUse />
    </div>
</Route>

<style>
    .larger {
        font-size: larger;
    }

    .content {
        padding: 16px 0;
    }

    @media (max-width: 480px) {
    }
</style>
