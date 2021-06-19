<script>
    import { useNavigate } from "svelte-navigator";
    import TXT from "../i18n/ua";

    const navigate = useNavigate();

    const good = 0.9;

    export let Punct = {};
    export let Stats = {};
    export let Selected = [];
    export let onSelect = () => {};

    $: ratio = Stats[Punct.UUID] ? Math.round(Stats[Punct.UUID].ratio * 100) / 100 : null;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="punct" on:click={onSelect.bind(null, Punct)}>
    <div>
        <div class="checkbox" class:checked={Selected.includes(Punct)} />
    </div>

    <div>
        &sect; {Punct.Punct}
        {Punct.Title}
    </div>

    <div class="stats">
        <div class="ratio" class:good={ratio !== null && ratio >= good} class:bad={ratio !== null && ratio < good}>
            {ratio !== null ? ratio.toFixed(2) : "~"}
        </div>
    </div>

    <div>
        <span class="link" on:click={() => navigate(`./${Punct.Key}`)}>
            {TXT.Run}
        </span>
    </div>
</label>

<style>
    label {
        display: block;
        cursor: pointer;
    }

    .punct {
        display: grid;
        grid-gap: 8px;
        grid-template-columns: min-content 1fr min-content min-content;
        justify-content: center;
        align-items: center;
        padding: 8px 0;
    }
    .punct:hover {
        background-color: #f2f2f2;
    }

    .punct > :first-child {
        padding-left: 8px;
    }
    .punct > :last-child {
        padding-right: 8px;
    }

    .checkbox {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        background-color: #dddddd;
        transition: all 350ms ease;
    }

    .checkbox::after {
        content: "";
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 24px;
        transform: scale(0);
        transition: all 350ms ease, transform 10ms ease 350ms, border-radius 10ms ease 350ms;
    }
    .checkbox.checked::after {
        border-radius: 4px;
        transform: scale(1);
        background-color: dodgerblue;
        transition: all 350ms ease;
    }

    .ratio {
        width: 40px;
        font-size: smaller;
        text-align: center;
    }
    .good {
        color: yellowgreen;
    }
    .bad {
        color: tomato;
    }
</style>
