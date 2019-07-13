import HelloWorld from './components/HelloWorld.vue';
import Posts from './components/Posts.vue';
import NewPost from './components/NewPost.vue';
import EditPost from './components/EditPosts.vue';



const routes = [
    {path: '/', name: 'Hello', component: HelloWorld },
    {path: '/posts/', name: 'Posts', component: Posts },
    {path: '/posts/new', name: 'NewPost', component: NewPost },
    {path: '/posts/:id', name: 'EditPost', component: EditPost}
]

export default routes;   