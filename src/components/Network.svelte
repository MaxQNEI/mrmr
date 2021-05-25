<script>
    import { Connected } from "../stores";

    let Open = false;
    $: Open = (!$Connected ? false : Open);
</script>

<div class={"network" + (Open ? " opened" : "")}>
    <div class="content">
        <slot />
    </div>

    <div class="open-wrap">
        <div class={"open" + ($Connected ? " connected" : "")} on:click={() => (Open = !Open)} />
    </div>
</div>

<style>
    .network {
        position: fixed;
        z-index: 100;
        right: 10px;
        bottom: 10px;

        display: grid;
        justify-content: flex-end;
    }

    .network .open-wrap {
        display: flex;
        justify-content: flex-end;
    }

    .network .open {
        width: 48px;
        height: 48px;
        border-radius: 48px;
        background: center / 80% no-repeat url("/static/network-tomato.svg");
        cursor: pointer;
        opacity: 0.7;
    }

    .network .open:hover {
        opacity: 1;
    }

    .network .open.connected {
        background-image: url("/static/network-dodgerblue.svg");
    }

    .network .content {
        display: none;
    }

    .network.opened .content {
        display: grid;
        grid-gap: 8px;
        padding: 8px;
        /* border-radius: 4px; */
        box-shadow: 0 0 10px #999999;
        background-color: rgba(255, 255, 255, 0.8);
    }
</style>
