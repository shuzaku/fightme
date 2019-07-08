import HelloWorld from './components/HelloWorld.vue';
import Posts from './components/Posts.vue';
import NewPost from './components/NewPost.vue';


const routes = [
    { path: '/', component: HelloWorld },
    { path: '/posts/', component: Posts },
    { path: '/posts/new', component: NewPost }
]

export default routes;  