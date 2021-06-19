<script>
    import { onDestroy } from "svelte";
    import { Socket } from "../stores";
    import { BreadcrumbsItems } from "../stores";
    import PunctItem from "./PunctItem.svelte";

    import TXT from "../i18n/ua";

    let PunctList = [];
    let Selected = [];
    let Stats = {};

    $Socket.once("set-punct-list", (puncts) => {
        PunctList = puncts;
    });
    $Socket.emit("get-punct-list");

    $Socket.on("set-punct-stats", (stats) => {
        console.debug(stats);
        Stats = { ...Stats, ...stats };
    });
    $Socket.emit("get-punct-stats");

    $BreadcrumbsItems = [
        {
            html: TXT.Tests,
        },
    ];

    function onSelect(punct) {
        if (Selected.includes(punct)) {
            Selected = Selected.filter((_punct) => _punct !== punct);
        } else {
            Selected = [...Selected, punct];
        }
    }

    function uncheckAll() {
        Selected = [];
    }

    function checkAll() {
        Selected = [...PunctList];
    }

    function checkDefault() {
        Selected = PunctList.filter((punct) => {
            return parseInt(punct.Punct) < 40;
        });
    }
</script>

{#if PunctList && PunctList.length > 0}
    <div class="tab">
        <button on:click={uncheckAll} disabled={!Selected.length}>{TXT.UncheckAll}</button>
        <button on:click={checkAll} disabled={Selected.length >= PunctList.length}>{TXT.CheckAll}</button>
        <button on:click={checkDefault}>{TXT.Default}</button>
        <button disabled={!Selected.length}>{TXT.Run}</button>
    </div>

    <div class="list">
        {#each PunctList as Punct}
            <PunctItem {Punct} {Stats} {Selected} {onSelect} />
        {/each}
    </div>
{/if}

<style>
    .tab {
        position: sticky;
        top: 0;
        z-index: 10;

        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(0, max-content));
        grid-gap: 8px;
        padding: 8px;
        box-shadow: 0 0 15px #cccccc;
        background-color: rgba(255, 255, 255, 0.9);
    }

    .list {
        display: grid;
    }

    @media (max-width: 480px) {
        .tab {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>
