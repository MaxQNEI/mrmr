<script>
    import { Route } from "svelte-navigator";

    import Sidebar from "./components/Sidebar.svelte";

    import Home from "./Home.svelte";
    import Tests from "./Tests.svelte";
    import About from "./About.svelte";
    import Support from "./Support.svelte";
    import Policy from "./Policy.svelte";
</script>

<div class="container">
    <Sidebar />

    <div class="content">
        <Route path="/">
            <Home />
        </Route>

        <Route path="/tests/*" primary={false}>
            <Tests />
        </Route>

        <Route path="/about" primary={false}>
            <About />
        </Route>

        <Route path="/support" primary={false}>
            <Support />
        </Route>

        <Route path="/policy/*" primary={false}>
            <Policy />
        </Route>
    </div>
</div>

<style>
    .container {
        display: grid;
        grid-template-columns: min-content 1fr;
    }

    .content {
        position: relative;
        display: block;
        padding: 24px;
    }

    @media (max-width: 480px) {
        .container {
            display: block;
        }

        .content {
            padding: 16px;
        }
    }
</style>
