<script>
    export let bg = 'white';
</script>

<div class="category-message" style="background-color: {bg};">
    <slot />
</div>

<style>
    .category-message {
        padding: 16px;
        box-shadow: 0 0 15px #666666;
    }
</style>
