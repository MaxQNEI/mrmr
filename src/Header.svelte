<script>
    import { useNavigate } from "svelte-navigator";
    import { Title, ShowSidebar } from "./stores.js";

    const navigate = useNavigate();
</script>

<header>
    <site-menu-button on:click={() => ($ShowSidebar = !$ShowSidebar)} />
    <h2>{$Title}</h2>
    <site-help-button on:click={() => navigate("/support")} />
</header>

<style>
    header {
        position: relative;
        z-index: 1;

        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 0fr;
        justify-content: center;
        align-items: center;
        min-height: 64px;
        padding: 0 20px;
        box-shadow: 0 0 10px #666666;

        background-color: dodgerblue;
        color: #ffffff;
    }

    site-menu-button,
    site-help-button {
        width: 24px;
        height: 24px;
        cursor: pointer;
    }

    site-menu-button {
        display: none;
        background: center / contain no-repeat url("/static/grid.svg");
    }

    site-help-button {
        background: center / contain no-repeat url("/static/customer-support.svg");
    }

    @media (max-width: 480px) {
        header {
            grid-template-columns: 0fr 1fr 0fr;
        }

        header h2 {
            text-align: center;
        }

        site-menu-button {
            display: block;
        }
    }
</style>
