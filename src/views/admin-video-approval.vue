<!-- @format -->
<template>
    <div ref="videoApprovalRef" class="admin-video-approval">
        <div class="admin-header">
            <h1>Video Approval Queue</h1>
            <p>Review and approve pending video submissions</p>
        </div>

        <div v-if="pendingVideos.length > 0" class="videos-container">
            <div v-for="(video, index) in pendingVideos" :key="index" class="video-approval-item">
                <div class="video-card-wrapper">
                    <admin-video-card
                        v-model="video.isPlaying"
                        :video="video"
                        :rawVideoData="video.rawVideoData"
                        :videoId="video.id"
                        :account="account"
                        :favoriteVideos="account ? account.favoriteVideos : null"
                        :isFirst="video.isFirst"
                        @video:delete="refreshDelete()"
                    />
                </div>

                <div class="approval-controls">
                    <div class="video-info">
                        <h3>Video Information</h3>
                        <p>
                            <strong>Submitted by:</strong>
                            {{ video.submittedBy || 'Unknown' }}
                        </p>
                        <p><strong>Submitted on:</strong> {{ video.createdAt }}</p>
                        <p><strong>Content Type:</strong> {{ video.contentType }}</p>
                        <p><strong>Video Type:</strong> {{ video.videoType }}</p>
                        <p v-if="video.tags && video.tags.length > 0">
                            <strong>Tags:</strong>
                            {{ video.tags.map((tag) => tag.name).join(', ') }}
                        </p>
                    </div>

                    <div class="action-buttons">
                        <v-btn
                            color="success"
                            dark
                            large
                            :loading="video.approving"
                            :disabled="video.approving || video.rejecting"
                            @click="approveVideo(video)"
                        >
                            <v-icon left>mdi-check</v-icon>
                            Approve
                        </v-btn>

                        <v-btn
                            color="error"
                            dark
                            large
                            :loading="video.rejecting"
                            :disabled="video.approving || video.rejecting"
                            @click="rejectVideo(video)"
                        >
                            <v-icon left>mdi-close</v-icon>
                            Reject
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="!loading" class="no-videos">
            <v-alert type="info" outlined>
                <v-icon left>mdi-information</v-icon>
                No pending videos to review at this time.
            </v-alert>
        </div>

        <loading v-show="loading"></loading>

        <!-- Reject Dialog -->
        <v-dialog v-model="rejectDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Reject Video</span>
                </v-card-title>
                <v-card-text>
                    <p>Please provide a reason for rejecting this video:</p>
                    <v-textarea
                        v-model="rejectReason"
                        label="Rejection reason"
                        rows="3"
                        placeholder="Enter reason for rejection..."
                    ></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" text @click="rejectDialog = false"> Cancel </v-btn>
                    <v-btn
                        color="error"
                        :loading="currentVideo && currentVideo.rejecting"
                        @click="rejectVideo(currentVideo)"
                    >
                        Reject
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Success/Error Messages -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
            {{ snackbar.message }}
        </v-snackbar>
    </div>
</template>

<script>
import VideosService from '@/services/videos-service';
import AdminVideoCard from '@/components/videos/admin-video-card';
import Loading from '@/components/common/loading';
import AuthService from '@/services/auth-service';
import moment from 'moment';

export default {
    name: 'AdminVideoApproval',

    components: {
        'admin-video-card': AdminVideoCard,
        loading: Loading,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            pendingVideos: [],
            loading: true,
            skip: 0,
            rejectDialog: false,
            rejectReason: '',
            currentVideo: null,
            snackbar: {
                show: false,
                message: '',
                color: 'success',
            },
        };
    },

    computed: {
        isAdmin() {
            return (
                this.account &&
                this.account.role === 'admin'
            );
        },
    },

    mounted() {
        console.log('Admin Video Approval - Account:', this.account);
        console.log(
            'Admin Video Approval - Account Role:',
            this.account ? this.account.role : 'No account'
        );
        console.log('Admin Video Approval - Is Admin:', this.isAdmin);

        if (!this.isAdmin) {
            console.log('Not admin, redirecting to home');
            this.$router.push('/');
            return;
        }
        this.loadPendingVideos();
    },

    methods: {
        async loadPendingVideos() {
            try {
                this.loading = true;
                const response = await VideosService.getPendingVideos({ skip: this.skip });
                this.hydrateVideos(response);
            } catch (error) {
                console.error('Error loading pending videos:', error);
                this.showSnackbar('Error loading pending videos', 'error');
            } finally {
                this.loading = false;
            }
        },

        hydrateVideos(response) {
            const videos = response.data.video_validates || [];
            this.pendingVideos = videos.map((video) => {
                // Store raw video data for the component
                const rawVideoData = video;
                return {
                    id: video._id,
                    matchId: video.matchId || video._id,
                    contentType: video.ContentType || 'Match',
                    videoType: video.VideoType,
                    url: video.Url,
                    isPlaying: false,
                    isEditing: false,
                    isFirst: false,
                    approving: false,
                    rejecting: false,
                    isFavorited: false,
                    submittedBy: video.SubmittedByUser.DisplayName,
                    submittedAt: video.SubmittedAt || video.CreatedAt,
                    tags: video.Tags || [],
                    createdAt: moment(video.CreatedAt).local().format('MM/DD/YYYY'),

                    game: video.Game
                        ? {
                              id: video.Game._id,
                              title: video.Game.Title,
                              logoUrl: video.Game.LogoUrl,
                          }
                        : null,
                    combo: {},
                    match: {
                        team1Players: video.Team1Players.map((player) => {
                            return {
                                id: player.Id,
                                slot: player.Slot,
                                name: player.PlayerData.Name || 'Unknown Player', // Add name if available
                                characters: player.CharacterData.map((character) => {
                                    return {
                                        name: character.Name,
                                        id: character.id,
                                        imageUrl: character.AvatarUrl,
                                    };
                                }),
                            };
                        }),
                        team2Players: video.Team2Players.map((player) => {
                            return {
                                id: player.Id,
                                name: player.PlayerData.Name || 'Unknown Player', // Add name if available
                                characters: player.CharacterData.map((character) => {
                                    return {
                                        name: character.Name,
                                        id: character.id,
                                        imageUrl: character.AvatarUrl,
                                    };
                                }),
                            };
                        }),
                        startTime: video.StartTime ? this.convertTime(video.StartTime) : null,
                        endTime: video.EndTime ? this.convertTime(video.EndTime) : null,
                    },
                    rawVideoData: rawVideoData,
                };
            });

            // Set first video as playing
            if (this.pendingVideos.length > 0) {
                this.pendingVideos[0].isFirst = true;
            }
        },

        convertTime(time) {
            var a = time.split(':');
            var n = a.length;
            var minutesToSeconds = null;
            var hoursToSeconds = null;
            var seconds = 0;
            if (n === 3) {
                hoursToSeconds = parseInt(a[0]) * 3600;
                minutesToSeconds = parseInt(a[1]) * 60;
                seconds = hoursToSeconds + minutesToSeconds + parseInt(a[2]);
            } else if (n === 2) {
                minutesToSeconds = parseInt(a[0]) * 60;
                seconds = minutesToSeconds + parseInt(a[1]);
            } else {
                return parseInt(a[0]);
            }
            seconds === 0 ? seconds++ : seconds;
            return seconds;
        },

        async approveVideo(video) {
            try {
                video.approving = true;
                await VideosService.approveVideo(video.id);

                // Remove video from pending list
                this.pendingVideos = this.pendingVideos.filter((v) => v.id !== video.id);

                this.showSnackbar('Video approved successfully', 'success');
            } catch (error) {
                console.error('Error approving video:', error);
                this.showSnackbar('Error approving video', 'error');
            } finally {
                video.approving = false;
            }
        },

        async rejectVideo(video) {
            try {
                video.rejecting = true;
                await VideosService.rejectVideo(video.id, this.rejectReason);

                // Remove video from pending list
                this.pendingVideos = this.pendingVideos.filter((v) => v.id !== video.id);

                this.showSnackbar('Video rejected successfully', 'success');
                this.rejectDialog = false;
            } catch (error) {
                console.error('Error rejecting video:', error);
                this.showSnackbar('Error rejecting video', 'error');
            } finally {
                video.rejecting = false;
            }
        },

        refreshDelete() {
            // Refresh the list when a video is deleted
            this.loadPendingVideos();
        },

        formatDate(dateString) {
            if (!dateString) return 'Unknown';
            return new Date(dateString).toLocaleDateString();
        },

        showSnackbar(message, color = 'success') {
            this.snackbar = {
                show: true,
                message,
                color,
            };
        },
    },
};
</script>

<style>
.admin-video-approval {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.admin-video-approval .admin-header {
    text-align: center;
    margin-bottom: 30px;
}

.admin-video-approval .admin-header h1 {
    color: #3eb489;
    margin-bottom: 10px;
}

.admin-video-approval .admin-header p {
    color: #666;
    font-size: 16px;
}

.admin-video-approval .video-approval-item {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;
    padding: 20px;
    border-radius: 10px;
    border: 2px solid #e0e0e0;
    color: #fff;
}

.admin-video-approval .video-card-wrapper {
    flex: 1;
    min-width: 0;
}

.admin-video-approval .approval-controls {
    flex: 0 0 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.admin-video-approval .video-info {
    margin-bottom: 20px;
}

.admin-video-approval .video-info h3 {
    color: #fff;
    margin-bottom: 15px;
    font-size: 18px;
}

.admin-video-approval .video-info p {
    margin-bottom: 8px;
    color: #fff;
    font-size: 14px;
}

.admin-video-approval .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.admin-video-approval .action-buttons .v-btn {
    width: 100%;
}

.admin-video-approval .no-videos {
    text-align: center;
    padding: 40px;
}

.admin-video-approval .match-card {
    margin: 0px 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .video-approval-item {
        flex-direction: column;
    }

    .approval-controls {
        flex: none;
        width: 100%;
    }

    .action-buttons {
        flex-direction: row;
        gap: 10px;
    }

    .action-buttons .v-btn {
        flex: 1;
    }
}
</style>
