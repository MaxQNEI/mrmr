<script>
    import { useNavigate } from "svelte-navigator";
    import { BreadcrumbsItems } from "../stores";

    const navigate = useNavigate();
</script>

<div class="breadcrumbs">
    <h2>
        {#each $BreadcrumbsItems as crumb, index}
            {#if crumb.onClick || crumb.to}
                <button class="link" on:click={() => {
                    crumb.onClick && crumb.onClick();
                    crumb.to && navigate(crumb.to);
                }}>
                    {@html crumb.html}
                </button>
            {:else}
                {@html crumb.html}
            {/if}

            {#if index < $BreadcrumbsItems.length - 1}
                {" / "}
            {/if}
        {/each}
    </h2>
</div>
