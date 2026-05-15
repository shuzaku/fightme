<!-- @format -->
<template>
    <div class="auth-example">
        <h2>Authentication Usage Examples</h2>

        <!-- Basic authentication check -->
        <div v-if="isAuthenticated" class="section">
            <h3>Welcome, {{ user && (user.displayName || user.email) }}!</h3>
            <p>Role: {{ user && user.role }}</p>
            <v-btn color="error" @click="logout">Logout</v-btn>
        </div>

        <div v-else class="section">
            <h3>Please log in to continue</h3>
            <v-btn color="primary" @click="showLogin = true">Login</v-btn>
        </div>

        <!-- Permission-based content -->
        <div class="section">
            <h3>Permission Examples</h3>

            <!-- Using AuthGuard component -->
            <AuthGuard action="create" resource="videos" :show-fallback="true">
                <v-btn color="success">Create Video</v-btn>
            </AuthGuard>

            <AuthGuard action="edit" resource="videos" :content-owner-id="user && user.id">
                <v-btn color="warning">Edit My Videos</v-btn>
            </AuthGuard>

            <AuthGuard action="manage" resource="users">
                <v-btn color="error">Manage Users</v-btn>
            </AuthGuard>

            <!-- Using computed properties -->
            <div v-if="canCreateContent" class="permission-section">
                <h4>You can create content!</h4>
                <v-btn color="primary" @click="createContent">Create New Content</v-btn>
            </div>

            <div v-if="isAdmin" class="permission-section">
                <h4>Admin Panel</h4>
                <v-btn color="purple" @click="openAdminPanel">Open Admin Panel</v-btn>
            </div>

            <div v-if="canModerate" class="permission-section">
                <h4>Moderation Tools</h4>
                <v-btn color="orange" @click="openModeration">Moderate Content</v-btn>
            </div>
        </div>

        <!-- API Usage Examples -->
        <div class="section">
            <h3>API Usage Examples</h3>
            <v-btn :loading="loading" color="info" @click="fetchUserData"> Fetch User Data </v-btn>
            <v-btn :loading="loading" color="info" @click="fetchProtectedData">
                Fetch Protected Data
            </v-btn>
        </div>

        <!-- Login Modal -->
        <v-dialog v-model="showLogin" max-width="400">
            <login @closeModal="showLogin = false" />
        </v-dialog>
    </div>
</template>

<script>
import AuthService from '@/services/auth-service';
import PermissionsService from '@/services/permissions-service';
import Login from '@/components/account/login.vue';
import AuthGuard from '@/components/common/auth-guard.vue';

export default {
    name: 'AuthUsageExample',
    components: {
        Login,
        AuthGuard,
    },
    data() {
        return {
            showLogin: false,
            loading: false,
            user: null,
        };
    },
    computed: {
        isAuthenticated() {
            return AuthService.isAuthenticated();
        },
        canCreateContent() {
            return PermissionsService.canCreateVideos();
        },
        isAdmin() {
            return PermissionsService.isAdmin();
        },
        canModerate() {
            return PermissionsService.canModerate();
        },
    },
    mounted() {
        this.user = AuthService.getUser();
    },
    methods: {
        logout() {
            AuthService.logout();
            this.user = null;
            this.$router.push('/');
        },

        async createContent() {
            if (!this.canCreateContent) {
                this.$toast.error('You do not have permission to create content');
                return;
            }

            // Your content creation logic here
            console.log('Creating content...');
        },

        openAdminPanel() {
            if (!this.isAdmin) {
                this.$toast.error('Admin access required');
                return;
            }

            // Navigate to admin panel
            this.$router.push('/admin');
        },

        openModeration() {
            if (!this.canModerate) {
                this.$toast.error('Moderation access required');
                return;
            }

            // Navigate to moderation panel
            this.$router.push('/moderation');
        },

        async fetchUserData() {
            this.loading = true;
            try {
                // Using the updated Api service with automatic auth headers
                const response = await this.$http.get('/user/profile');
                console.log('User data:', response.data);
                this.$toast.success('User data fetched successfully');
            } catch (error) {
                console.error('Error fetching user data:', error);
                this.$toast.error('Failed to fetch user data');
            } finally {
                this.loading = false;
            }
        },

        async fetchProtectedData() {
            this.loading = true;
            try {
                // Using AuthService for custom authenticated requests
                const response = await AuthService.makeAuthenticatedRequest('/api/protected-data');
                const data = await response.json();
                console.log('Protected data:', data);
                this.$toast.success('Protected data fetched successfully');
            } catch (error) {
                console.error('Error fetching protected data:', error);
                this.$toast.error('Failed to fetch protected data');
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.auth-example {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.section {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
}

.permission-section {
    margin: 10px 0;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
}

h3,
h4 {
    margin-bottom: 15px;
}

.v-btn {
    margin: 5px;
}
</style>
