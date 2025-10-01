<!-- @format -->
<template>
    <div v-if="hasPermission">
        <slot></slot>
    </div>
    <div v-else-if="showFallback" class="auth-guard-fallback">
        <v-alert type="warning" outlined>
            <v-icon left>mdi-lock</v-icon>
            {{ fallbackMessage }}
        </v-alert>
    </div>
</template>

<script>
import AuthService from '@/services/auth-service';
import PermissionsService from '@/services/permissions-service';

export default {
    name: 'AuthGuard',
    props: {
        // Permission to check (e.g., 'create', 'edit', 'delete')
        action: {
            type: String,
            required: true,
        },
        // Resource to check permission for (e.g., 'videos', 'characters')
        resource: {
            type: String,
            required: true,
        },
        // Content owner ID for ownership-based permissions
        contentOwnerId: {
            type: String,
            default: null,
        },
        // Show fallback message when permission denied
        showFallback: {
            type: Boolean,
            default: true,
        },
        // Custom fallback message
        fallbackMessage: {
            type: String,
            default: 'You do not have permission to perform this action.',
        },
    },
    computed: {
        hasPermission() {
            if (!AuthService.isAuthenticated()) {
                return false;
            }

            // Check specific action and resource
            if (this.action && this.resource) {
                return PermissionsService.canPerformAction(this.action, this.resource);
            }

            // Check content ownership for edit/delete actions
            if (['edit', 'delete'].includes(this.action) && this.contentOwnerId) {
                return PermissionsService.canEditContent(this.resource, this.contentOwnerId);
            }

            return false;
        },
    },
};
</script>

<style scoped>
.auth-guard-fallback {
    margin: 16px 0;
}
</style>

