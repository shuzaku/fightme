<!-- @format -->
<template>
    <div class="match-notes">
        <div class="notes-header">
            <h2><i class="fas fa-sticky-note"></i> Match Notes</h2>
            <v-btn
                v-if="account"
                class="add-note-btn"
                rounded
                small
                @click="showAddNoteModal = true"
            >
                <i class="fas fa-plus"></i> Add Note
            </v-btn>
        </div>

        <div v-if="!account" class="login-prompt">
            <p>Please log in to add notes to this match.</p>
        </div>

        <div v-else-if="notes && notes.length === 0" class="no-notes">
            <p>No notes yet. Be the first to add one!</p>
        </div>

        <div v-else class="notes-list">
            <div v-for="note in notes" :key="note.id" class="note-item">
                <div class="note-header">
                    <div class="note-meta">
                        <span
                            v-if="note.timestamp"
                            class="timestamp"
                            @click="seekToTimestamp(note.timestamp)"
                        >
                            <i class="fas fa-clock"></i> {{ formatTimestamp(note.timestamp) }}
                        </span>
                        <span class="author">{{ note.authorName || 'Anonymous' }}</span>
                        <span class="date">{{ formatDate(note.createdAt) }}</span>
                    </div>
                    <div class="note-actions">
                        <v-btn
                            icon
                            small
                            @click="toggleLike(note)"
                            :class="{ liked: isNoteLiked(note) }"
                        >
                            <i class="fas fa-heart"></i>
                        </v-btn>
                        <span class="like-count">{{ note.likes || 0 }}</span>
                        <v-btn
                            v-if="note.authorId === account.id"
                            icon
                            small
                            @click="editNote(note)"
                        >
                            <i class="fas fa-edit"></i>
                        </v-btn>
                        <v-btn
                            v-if="note.authorId === account.id"
                            icon
                            small
                            @click="deleteNote(note.id)"
                        >
                            <i class="fas fa-trash"></i>
                        </v-btn>
                    </div>
                </div>
                <div v-if="note.heading" class="note-heading">{{ note.heading }}</div>
                <div class="note-content" v-html="note.content"></div>
            </div>
        </div>

        <!-- Add/Edit Note Modal -->
        <div
            v-if="showAddNoteModal || editingNote"
            class="note-modal-overlay"
            @click.self="closeModal"
        >
            <div class="note-modal">
                <button class="close-button" @click="closeModal" aria-label="Close">
                    <span class="close-icon">×</span>
                </button>
                <div class="note-modal-content">
                    <h3>{{ editingNote ? 'Edit Note' : 'Add Note' }}</h3>

                    <div class="form-fields">
                        <div class="input-wrapper">
                            <i class="fas fa-heading input-icon"></i>
                            <v-text-field
                                v-model="noteForm.heading"
                                type="text"
                                placeholder="Note Heading (optional)"
                                dark
                                outlined
                            />
                        </div>

                        <div class="input-wrapper">
                            <i class="fas fa-align-left input-icon"></i>
                            <quill-editor
                                dark
                                ref="noteEditor"
                                v-model="noteForm.content"
                                :options="editorOptions"
                            />
                        </div>

                        <div class="timestamp-section">
                            <div class="timestamp-controls">
                                <v-btn
                                    class="capture-timestamp-btn"
                                    rounded
                                    small
                                    @click="captureCurrentTimestamp"
                                >
                                    <i class="fas fa-video"></i> Capture Current Time
                                </v-btn>
                                <v-btn
                                    v-if="noteForm.timestamp"
                                    class="clear-timestamp-btn"
                                    rounded
                                    small
                                    text
                                    @click="noteForm.timestamp = null"
                                >
                                    <i class="fas fa-times"></i> Clear
                                </v-btn>
                            </div>
                            <div v-if="noteForm.timestamp" class="timestamp-display">
                                <i class="fas fa-clock"></i>
                                {{ formatTimestamp(noteForm.timestamp) }}
                            </div>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <v-btn
                            class="submit-btn"
                            rounded
                            large
                            @click="saveNote"
                            :disabled="!noteForm.content || isSaving"
                            :loading="isSaving"
                        >
                            <i class="fas fa-save"></i>
                            {{ editingNote ? 'Update Note' : 'Save Note' }}
                        </v-btn>
                        <v-btn
                            class="cancel-btn"
                            rounded
                            text
                            @click="closeModal"
                            :disabled="isSaving"
                        >
                            Cancel
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MatchNotesService from '@/services/match-notes-service';
import moment from 'moment';
import { eventbus } from '@/main';

function normalizeVideoId(raw) {
    if (raw == null || raw === '') return '';
    const s = String(raw).trim();
    if (!s) return '';
    if (s.includes('youtu.be/')) {
        return s.split('youtu.be/')[1].split(/[?&#]/)[0];
    }
    if (s.includes('youtube.com') || s.includes('youtube-nocookie.com')) {
        const vMatch = s.match(/[?&]v=([^&]+)/);
        if (vMatch) return vMatch[1];
        const embedMatch = s.match(/\/embed\/([^?&#]+)/);
        if (embedMatch) return embedMatch[1];
    }
    if (s.includes('v=')) {
        let id = s.substring(s.indexOf('v=') + 2);
        const amp = id.indexOf('&');
        if (amp !== -1) id = id.substring(0, amp);
        return id;
    }
    return s;
}

export default {
    name: 'MatchNotes',

    props: {
        matchId: {
            type: String,
            default: '',
        },
        videoUrl: {
            type: String,
            default: '',
        },
        account: {
            type: Object,
            default: null,
        },
        videoPlayer: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            notes: [],
            isLoading: false,
            showAddNoteModal: false,
            editingNote: null,
            isSaving: false,
            noteForm: {
                heading: '',
                content: '',
                timestamp: null,
            },
            editorOptions: {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link'],
                    ],
                },
            },
        };
    },

    computed: {
        normalizedVideoUrl() {
            return normalizeVideoId(this.videoUrl);
        },
        notesLookupKey() {
            if (this.normalizedVideoUrl) {
                return 'v:' + this.normalizedVideoUrl;
            }
            if (this.matchId) {
                return 'm:' + this.matchId;
            }
            return '';
        },
    },

    watch: {
        notesLookupKey: {
            immediate: true,
            handler(key) {
                if (!key) {
                    this.notes = [];
                    return;
                }
                this.loadNotes();
            },
        },
        videoPlayer: {
            immediate: true,
            handler(newPlayer) {
                if (newPlayer) {
                    // Video player is now available
                }
            },
        },
    },

    mounted() {
        eventbus.$on('match-note:update', this.loadNotes);
    },

    beforeDestroy() {
        eventbus.$off('match-note:update', this.loadNotes);
    },

    methods: {
        async loadNotes() {
            let searchQuery = [];
            if (this.normalizedVideoUrl) {
                searchQuery.push({
                    queryName: 'VideoUrl',
                    queryValue: this.normalizedVideoUrl,
                });
            } else if (this.matchId) {
                searchQuery.push({
                    queryName: 'MatchId',
                    queryValue: this.matchId,
                });
            } else {
                this.notes = [];
                return;
            }

            this.isLoading = true;
            try {
                const queryParameter = {
                    searchQuery: searchQuery,
                };

                const response = await MatchNotesService.queryMatchNotes(queryParameter);
                this.notes = (response.data.matchNotes || [])
                    .map((note) => ({
                        id: note._id,
                        heading: note.Heading,
                        content: note.Content,
                        timestamp: note.Timestamp || null,
                        authorId:
                            note.AuthorId && note.AuthorId._id ? note.AuthorId._id : note.AuthorId,
                        authorName:
                            note.AuthorId && note.AuthorId.DisplayName
                                ? note.AuthorId.DisplayName
                                : null,
                        createdAt: note.CreatedAt || note.createdAt,
                        likes: note.Likes || 0,
                        likedBy: note.LikedBy || [],
                        isPinned: note.IsPinned || false,
                        isEdited: note.IsEdited || false,
                        tags: note.Tags || [],
                    }))
                    .sort((a, b) => {
                        // Sort pinned notes first, then by timestamp if available, otherwise by creation date
                        if (a.isPinned && !b.isPinned) return -1;
                        if (!a.isPinned && b.isPinned) return 1;
                        if (a.timestamp && b.timestamp) {
                            return a.timestamp - b.timestamp;
                        }
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
            } catch (error) {
                console.error('Error loading notes:', error);
                this.notes = [];
            } finally {
                this.isLoading = false;
            }
        },

        captureCurrentTimestamp() {
            if (this.videoPlayer && typeof this.videoPlayer.getCurrentTime === 'function') {
                const currentTime = this.videoPlayer.getCurrentTime();
                this.noteForm.timestamp = Math.floor(currentTime);
            } else {
                // Fallback: emit event to parent to get timestamp
                this.$emit('capture-timestamp');
                // The parent will update videoPlayer prop, so we'll try again on next tick
                this.$nextTick(() => {
                    if (this.videoPlayer && typeof this.videoPlayer.getCurrentTime === 'function') {
                        const currentTime = this.videoPlayer.getCurrentTime();
                        this.noteForm.timestamp = Math.floor(currentTime);
                    }
                });
            }
        },

        seekToTimestamp(timestamp) {
            if (this.videoPlayer && typeof this.videoPlayer.seekTo === 'function') {
                this.videoPlayer.seekTo(timestamp);
            } else {
                // Emit event to parent to seek
                this.$emit('seek-to-timestamp', timestamp);
            }
        },

        formatTimestamp(seconds) {
            if (!seconds) return '';
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        },

        formatDate(date) {
            if (!date) return '';
            return moment(date).format('MMM D, YYYY');
        },

        editNote(note) {
            this.editingNote = note;
            this.noteForm = {
                heading: note.heading || '',
                content: note.content || '',
                timestamp: note.timestamp || null,
            };
            this.showAddNoteModal = true;
        },

        async deleteNote(noteId) {
            if (!confirm('Are you sure you want to delete this note?')) {
                return;
            }

            try {
                await MatchNotesService.deleteMatchNote(noteId);
                eventbus.$emit('match-note:update');
                this.loadNotes();
            } catch (error) {
                console.error('Error deleting note:', error);
                alert('Failed to delete note. Please try again.');
            }
        },

        isNoteLiked(note) {
            if (!this.account || !note.likedBy) return false;
            return note.likedBy.some((userId) => userId.toString() === this.account.id.toString());
        },

        async toggleLike(note) {
            if (!this.account) {
                alert('Please log in to like notes');
                return;
            }

            try {
                const response = await MatchNotesService.toggleLikeMatchNote(
                    note.id,
                    this.account.id
                );
                // Update the note in the local array
                const noteIndex = this.notes.findIndex((n) => n.id === note.id);
                if (noteIndex !== -1) {
                    this.notes[noteIndex].likes = response.data.likes;
                    // Update likedBy array
                    if (response.data.isLiked) {
                        if (!this.notes[noteIndex].likedBy) {
                            this.notes[noteIndex].likedBy = [];
                        }
                        if (
                            !this.notes[noteIndex].likedBy.some(
                                (id) => id.toString() === this.account.id.toString()
                            )
                        ) {
                            this.notes[noteIndex].likedBy.push(this.account.id);
                        }
                    } else {
                        this.notes[noteIndex].likedBy = this.notes[noteIndex].likedBy.filter(
                            (id) => id.toString() !== this.account.id.toString()
                        );
                    }
                }
            } catch (error) {
                console.error('Error toggling like:', error);
                alert('Failed to like note. Please try again.');
            }
        },

        async saveNote() {
            if (!this.noteForm.content || !this.account) return;

            this.isSaving = true;
            try {
                const noteData = {
                    VideoUrl: this.normalizedVideoUrl || null,
                    MatchId: this.matchId || null,
                    Heading: this.noteForm.heading || null,
                    Content: this.noteForm.content,
                    AuthorId: this.account.id,
                    Timestamp: this.noteForm.timestamp || null,
                };

                if (this.editingNote) {
                    await MatchNotesService.updateMatchNote({
                        id: this.editingNote.id,
                        ...noteData,
                    });
                } else {
                    await MatchNotesService.addMatchNote(noteData);
                }

                eventbus.$emit('match-note:update');
                this.closeModal();
                this.loadNotes();
            } catch (error) {
                console.error('Error saving note:', error);
                alert('Failed to save note. Please try again.');
            } finally {
                this.isSaving = false;
            }
        },

        closeModal() {
            this.showAddNoteModal = false;
            this.editingNote = null;
            this.noteForm = {
                heading: '',
                content: '',
                timestamp: null,
            };
        },
    },
};
</script>

<style scoped>
.match-notes {
    background: #242832;
    border-radius: 15px;
    padding: 30px;
    margin: 30px 0;
    box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 54%);
}

.notes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notes-header h2 {
    color: #fff;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
}

.notes-header h2 i {
    color: #3eb489;
}

.add-note-btn {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%) !important;
    color: #fff !important;
    text-transform: none !important;
}

.add-note-btn i {
    margin-right: 6px;
}

.login-prompt,
.no-notes {
    text-align: center;
    padding: 40px 20px;
    color: #ffffff90;
}

.notes-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.note-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
}

.note-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(62, 180, 137, 0.3);
}

.note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.note-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.timestamp {
    color: #3eb489;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s ease;
}

.timestamp:hover {
    color: #2d8a6a;
    text-decoration: underline;
}

.author {
    color: #ffffff90;
    font-size: 14px;
}

.date {
    color: #ffffff60;
    font-size: 12px;
}

.note-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.note-actions button {
    color: #ffffff60 !important;
}

.note-actions button:hover {
    color: #3eb489 !important;
}

.note-actions button.liked {
    color: #ff6b6b !important;
}

.note-actions button.liked:hover {
    color: #ff5252 !important;
}

.like-count {
    color: #ffffff90;
    font-size: 14px;
    min-width: 20px;
    text-align: center;
}

.note-heading {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
}

.note-content {
    color: #ffffff90;
    line-height: 1.6;
}

.note-content >>> p {
    margin: 0 0 8px 0;
}

.note-content >>> p:last-child {
    margin-bottom: 0;
}

/* Modal Styles */
.note-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease;
}

.note-modal {
    position: relative;
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    background: linear-gradient(135deg, #191b2490 0%, #242832 100%);
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    animation: slideUp 0.4s ease;
}

.note-modal .close-button {
    position: absolute;
    top: 24px;
    right: 24px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 0;
    margin: 0;
}

.note-modal .close-icon {
    font-size: 32px;
    line-height: 1;
    font-weight: 300;
    display: block;
    color: #fff;
    transform: translateY(-2px);
}

.note-modal .close-button:hover {
    background: rgba(255, 59, 48, 0.9);
    border-color: rgba(255, 59, 48, 1);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 59, 48, 0.4);
}

.note-modal-content {
    padding: 50px 40px;
}

.note-modal-content h3 {
    color: #fff;
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 30px 0;
}

.form-fields {
    margin-bottom: 24px;
}

.input-wrapper {
    position: relative;
    margin-bottom: 20px;
}

.input-icon {
    position: absolute;
    left: 16px;
    top: 16px;
    color: #ffffff60;
    z-index: 2;
    font-size: 18px;
    pointer-events: none;
}

.input-wrapper .v-text-field {
    padding-left: 45px;
}

.timestamp-section {
    margin-top: 20px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.timestamp-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.capture-timestamp-btn {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%) !important;
    color: #fff !important;
    text-transform: none !important;
}

.capture-timestamp-btn i {
    margin-right: 6px;
}

.clear-timestamp-btn {
    color: #ffffff90 !important;
    text-transform: none !important;
}

.timestamp-display {
    color: #3eb489;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.submit-btn {
    background: linear-gradient(135deg, #3eb489 0%, #2d8a6a 100%) !important;
    color: #fff !important;
    font-weight: 600 !important;
    text-transform: none !important;
}

.submit-btn i {
    margin-right: 8px;
}

.cancel-btn {
    color: #ffffff90 !important;
    text-transform: none !important;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Quill Editor Dark Theme */
.match-notes >>> .ql-container {
    background-color: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    color: #fff !important;
    min-height: 200px;
}

.match-notes >>> .ql-editor {
    color: #fff !important;
}

.match-notes >>> .ql-editor.ql-blank::before {
    color: #ffffff60 !important;
}

.match-notes >>> .ql-toolbar {
    background-color: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px 12px 0 0 !important;
}

.match-notes >>> .ql-toolbar .ql-stroke {
    stroke: #fff !important;
}

.match-notes >>> .ql-toolbar .ql-fill {
    fill: #fff !important;
}

.match-notes >>> .ql-toolbar .ql-picker {
    color: #fff !important;
}
</style>
