<script>
    import { useNavigate } from "svelte-navigator";
    import { ShowSidebar } from "../stores";
    import TXT from "../i18n/ua";

    import Header from "./Header.svelte";

    const navigate = useNavigate();

    function nav(to) {
        $ShowSidebar = false;
        navigate(to);
    }
</script>

<div class="sidebar" class:show={$ShowSidebar === true}>
    <div class="mobile">
        <Header />
    </div>

    <div class="content">
        <div class="menu">
            <div class="menu-item" component="button" on:click={nav.bind(null, "/")}>
                <img class="fill" src="/static/fill-1x1.svg" alt="" />

                <div class="menu-item-content">
                    <div class="menu-item-icon" style="background-image: url('/static/sign-main-line.svg');" />
                    <div class="menu-item-text">{TXT.Home}</div>
                </div>
            </div>

            <div class="separator" />

            <div class="menu-item" component="button" on:click={nav.bind(null, "/tests")}>
                <img class="fill" src="/static/fill-1x1.svg" alt="" />

                <div class="menu-item-content">
                    <div class="menu-item-icon" style="background-image: url('/static/examination.svg');" />
                    <div class="menu-item-text">{TXT.Tests}</div>
                </div>
            </div>

            <div class="separator" />

            <div class="menu-item" component="button" on:click={nav.bind(null, "/policy")}>
                <img class="fill" src="/static/fill-1x1.svg" alt="" />

                <div class="menu-item-content">
                    <div class="menu-item-icon" style="background-image: url('/static/policy.svg');" />
                    <div class="menu-item-text">{TXT.Policy}</div>
                </div>
            </div>

            <div class="menu-item smaller onhover" component="button" on:click={nav.bind(null, "/policy/privacy")}>
                <img class="fill" src="/static/fill-1x1.svg" alt="" />

                <div class="menu-item-content">
                    <div class="menu-item-icon" style="background-image: url('/static/policy-privacy.svg');" />
                    <div class="menu-item-text">{TXT.PolicyPrivacy}</div>
                </div>
            </div>

            <div class="menu-item smaller onhover" component="button" on:click={nav.bind(null, "/policy/terms-of-use")}>
                <img class="fill" src="/static/fill-1x1.svg" alt="" />

                <div class="menu-item-content">
                    <div class="menu-item-icon" style="background-image: url('/static/policy-terms-of-use.svg');" />
                    <div class="menu-item-text">{TXT.PolicyTermsOfUse}</div>
                </div>
            </div>

            <div class="separator" />

            <div class="menu-item" component="button" on:click={nav.bind(null, "/about")}>
                <img class="fill" src="/static/fill-1x1.svg" alt="" />

                <div class="menu-item-content">
                    <div class="menu-item-icon" style="background-image: url('/static/about.svg');" />
                    <div class="menu-item-text">{TXT.About}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <a href="mailto:maxqnei@gmail.com">MaxQNEI</a> &copy; 2021
    </div>
</div>

<style>
    .sidebar {
        position: relative;
        display: grid;
        grid-template-rows: 1fr 0fr;
        background-color: rgba(119, 136, 153, 0.769);
        box-shadow: 0 0 10px #666666;
        color: #ffffff;
    }

    a {
        color: #ffffff;
    }

    .menu {
        position: sticky;
        top: 0;

        display: grid;
    }

    .menu .fill {
        display: none;
    }

    .separator {
        height: 0;
        margin: 0 16px;
        background-color: #ffffff;
    }
    .sidebar:hover .separator {
        height: 1px;
    }

    .footer {
        position: sticky;
        bottom: 0;
    }

    .menu-item {
        position: relative;

        border: unset;
        text-align: left;
        color: #ffffff;
        cursor: pointer;

        transition: all 300ms ease;
    }

    .menu-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .menu-item::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 0;
        background-color: white;

        transition: all 300ms ease;
    }

    .sidebar:hover .onhover {
        max-height: 50px;
        transform: scale(1);
    }

    /* menu-item.active, */
    .menu-item:hover::before {
        width: 4px;
    }

    .menu-item-content {
        display: grid;
        grid-auto-flow: column;
        grid-gap: 8px;
        grid-template-columns: repeat(auto-fit, minmax(0, max-content));
        justify-content: flex-start;
        align-items: center;
    }

    .menu-item-icon {
        display: block;
        width: 50px;
        height: 50px;
        background: center / contain no-repeat;
        transform-origin: center;
        transform: scale(0.8);
    }
    .menu-item.smaller .menu-item-icon {
        height: 25px;
    }

    .footer {
        text-align: center;
    }

    .menu-item,
    .footer {
        padding: 8px;
    }

    .mobile {
        display: none;
    }

    @media (min-width: 481px) {
        .sidebar {
            width: 50px;
            max-width: 25vw;
        }

        .menu-item {
            padding: 0;
        }

        .menu-item-text {
            transform: scale(0);
            transform-origin: center;
            font-size: 0;
            white-space: nowrap;
        }

        .footer {
            transform: scale(0);
            transform-origin: center;
            font-size: 0;
        }

        .sidebar:hover {
            width: 300px;
        }

        .sidebar:hover .menu-item-content {
            padding: 8px 16px;
        }

        .sidebar:hover .menu-item-text {
            transform: scale(1);
            font-size: medium;
        }

        .sidebar:hover .footer {
            transform: scale(1);
            font-size: medium;
        }

        .sidebar,
        .sidebar .menu-item,
        .sidebar .menu-item-text,
        .sidebar .footer {
            transition-delay: 200ms;
        }

        .sidebar:hover,
        .sidebar:hover .menu-item,
        .sidebar:hover .menu-item-text,
        .sidebar:hover .footer {
            transition-delay: 0ms;
        }

        .onhover {
            max-height: 0px;
            transform: scale(0);
        }
    }

    @media (max-width: 480px) {
        .mobile {
            display: block;
        }

        .sidebar {
            display: grid;
            grid-template-rows: min-content 1fr;
            position: fixed;
            z-index: 1000;
            top: 0;
            left: -100vw;
            bottom: 0;
            width: 100vw;
            height: 100%;
            background-color: transparent;
            box-shadow: none;
            opacity: 0;

            transition-property: opacity;
        }

        .sidebar .content,
        .sidebar .footer {
            opacity: 0;
            transition: all 300ms ease 150ms;
        }

        .sidebar.show {
            left: 0;
            opacity: 1;
            background-color: rgba(119, 136, 153, 0.769);
        }
        .sidebar.show .content,
        .sidebar.show .footer {
            opacity: 1;
        }

        .menu,
        .footer {
            position: static;
        }

        .menu .fill {
            display: none;
        }

        .menu-item {
            position: relative;
            display: block;
            padding: 0;
        }

        .menu-item::before {
            content: unset;
        }

        .menu-item-content {
            width: 100%;
            height: 100%;
            padding: 8px 16px;
        }

        .menu-item-icon {
            width: 40px;
            height: 40px;
        }

        .menu-item-text {
            text-align: center;
        }
    }
</style>
