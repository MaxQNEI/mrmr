<script>
    import { Router } from "svelte-navigator";

    import Header from "./Header.svelte";
    import Container from "./Container.svelte";

    import Network from "./components/Network.svelte";
</script>

<Router>
    <div class="app">
        <Header />
        <Container />
    </div>

    <Network />
</Router>

<style>
    .app {
        display: grid;
        grid-template-rows: 64px 1fr 0fr;
        height: 100%;
    }
</style>
