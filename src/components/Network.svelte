<script>
    import { Connected } from "../stores";
    import TXT from "../i18n/ua";

    let Open = false;
    $: Open = !$Connected ? false : Open;
</script>

<div class={"overlay" + ($Connected ? " connected" : "")}>
    <div>
        <h1>
            {TXT.Connecting}...
        </h1>
    </div>
</div>

<div class={"network" + (Open ? " opened" : "")}>
    <div class="content">
        <slot />
    </div>

    <div class="open-wrap">
        <div class={"open" + ($Connected ? " connected" : "")} on:click={() => (Open = !Open)} />
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1000;

        display: flex;
        justify-content: center;
        align-items: center;
        background: center / contain no-repeat #ffffff url("/static/connecting.svg");

        transition: all 1000ms ease, width 0ms, height 0ms;
    }
    .overlay.connected {
        width: 0;
        height: 0;
        opacity: 0;
        transition: all 1000ms ease 300ms, width 0ms 1300ms, height 0ms 1300ms;
    }

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
        box-shadow: 0 0 10px #999999;
        background-color: rgba(255, 255, 255, 0.8);
    }
</style>
