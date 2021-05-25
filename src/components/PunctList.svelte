<script>
    import { Socket, Connected } from "../stores";
    import { BreadcrumbsItems } from "../stores";
    import { useNavigate } from "svelte-navigator";

    import TXT from "../i18n/ua";

    const navigate = useNavigate();

    let PunctList = [];
    $Socket.once("set-punct-list", (puncts) => (PunctList = puncts));
    $Socket.emit("get-punct-list");

    $BreadcrumbsItems = [
        {
            html: TXT.Tests,
        },
    ];
</script>

{#if PunctList && PunctList.length > 0}
    <div class="punct-list">
        {#each PunctList as punct}
            <div class="punct-item">
                <button class="link" on:click={() => navigate(`./${punct.Key}`)}>
                    &sect; {punct.Punct}
                    {punct.Title}
                </button>
            </div>
        {/each}
    </div>
{/if}

<style>
    .punct-list {
        display: grid;
    }

    .punct-item {
        padding: 4px 0;
    }
    .punct-item button {
        font: inherit;
    }
</style>
