<!-- @format -->
<template>
    <div class="side-nav">
        <h3>Recommendation</h3>
    </div>
</template>

<script>
export default {
    name: 'SideNav',
    data() {
        return {};
    },

    methods: {}
};
</script>

<style type="text/css">
.side-nav {
    width: 400px;
    padding: 80px 30px;
    position: fixed;
    -webkit-box-pack: justify;
    justify-content: space-between;
}

.side-nav h2 {
    font-size: 30px;
    color: #3eb489;
    margin-bottom: 20px;
}

.side-nav .menu-item .menu-heading {
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #3eb489;
    margin-bottom: 20px;
    line-height: 1.2em;
    font-weight: 300;
    text-decoration: none;
}

.side-nav .menu-item .menu-heading:hover {
    color: #fff;
    opacity: 0.7;
    cursor: pointer;
}

.side-nav .sub-menu-item {
    padding-left: 20px;
    margin-top: 20px;
}

.side-nav .menu-heading svg {
    margin-right: 15px;
    width: 25px;
}

.side-nav .logo {
    display: flex;
    align-items: center;
    margin-bottom: 0px;
    color: #3eb489;
    text-transform: uppercase;
    font-size: 20px;
}

.side-nav .logo svg {
    font-size: 40px;
    margin-bottom: 50px;
    font-weight: 300;
    margin: 0;
    margin-right: 10px;
}
.side-nav .logo svg path {
    fill: #3eb489;
}

.side-nav .add-content-dropdown li {
    list-style: none;
    margin-bottom: 15px;
    cursor: pointer;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 300;
    margin-left: 40px;
}

.side-nav .add-content-dropdown li:hover {
    opacity: 0.7;
}

.side-nav .menu-item {
    margin-left: 40px;
}

.side-nav .menu-item a {
    text-decoration: none;
}

.side-nav h2 {
    font-weight: 400;
    color: #fff;
    letter-spacing: 3px;
    display: flex;
    align-items: center;
}

.side-nav h2 span {
    position: relative;
    top: -3px;
    margin-right: 5px;
}
</style>
