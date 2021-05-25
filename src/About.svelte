<script>
    import Article from "./components/Article.svelte";
    import TXT from "./i18n/ua";
</script>

<h2>{TXT.About}</h2>

<Article>
    <br>

    <p>{TXT.AboutText[0]}</p>
    <p>{TXT.AboutText[1]}</p>
    <p>{TXT.AboutText[2]}</p>
    <p>{TXT.AboutText[3]}</p>

    <div>
        <p>{TXT.Command}:</p>

        <team>
            <team-item style="background-image: url('/static/photo-camera.svg')">
                <img class="fill" src="/static/fill-1x1.svg" alt="" />
                <item-item-name>Максим</item-item-name>
            </team-item>

            <team-item style="background-image: url('/static/photo-camera.svg')">
                <img class="fill" src="/static/fill-1x1.svg" alt="" />
                <item-item-name>Андрій</item-item-name>
            </team-item>
        </team>
    </div>
</Article>

<style>
    team {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 200px));
        grid-gap: 24px;
        padding: 24px;
    }

    team-item {
        position: relative;
        width: 100%;
        border-radius: 200px;
        background: center / 50% no-repeat lightgray;
        color: #ffffff;
    }

    item-item-name {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: larger;
    }

    @media (max-width: 480px) {
        team {
            grid-gap: 48px;
            justify-content: center;
        }
    }
</style>
