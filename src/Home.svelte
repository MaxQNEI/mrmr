<script>
    import { useNavigate } from "svelte-navigator";
    import TXT from "./i18n/ua";

    const navigation = useNavigate();
</script>

<h2>{TXT.Home}</h2>

<div class="news">
    <div class="article">
        <sub class="date">
            21.06.18 23:20 | <button class="link" on:click={() => navigation("/about/#maxqnei")}>Maxim</button>
        </sub>

        <h3>"Скоро будет больше" / Авторизация через Google</h3>

        <p>На данный момент мы реализуем возможность авторизации с через Google.</p>

        <p>Возможность авторизации откроет новые возможности использования проекта:</p>

        <ol>
            <li>Ведение и наблюдение статистики ответов;</li>
            <li>
                Автоматическое создание индивидуального набора тестовых вопросов для закрепления материала в зависимости
                от результатов ответа;
            </li>
            <li>Возможность делится индивидуальными наборами тестовых вопросов;</li>
            <li>Создание собственных тестов с собственными вопросами;</li>
            <li>Режим аккаунта "Преподаватель" - для преподавателей автошкол;</li>
            <li>Режим аккаунта "Автоинструктор" - для автоинструкторов автошкол;</li>
            <li>Рекоммендации от преподавателей и/или автоинструкторов автошкол;</li>
            <li>...</li>
        </ol>
    </div>
</div>

<style>
    .news {
        display: grid;
        grid-gap: 24px;
        padding: 16px 0;
    }

    .article {
        display: grid;
        grid-gap: 16px;
        padding: 16px;
        box-shadow: 0 0 15px #cccccc;
    }
</style>
