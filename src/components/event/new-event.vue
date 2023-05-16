<!-- @format -->
<template>
    <div class="new-event">
        <h1>Add Event</h1>
        <div class="form">
            <div class="event-container">
                <div v-if="imageUrl" class="event-img-container">
                    <img :src="imageUrl" class="event-img" />
                    <v-btn @click="imageUrl = ''">X</v-btn>
                </div>
                <input v-model="eventName" type="text" name="Name" placeholder="Event Name" />
                <input
                    id="import-image"
                    v-model="imageUrl"
                    type="text"
                    placeholder="Event Image Url"
                />
                <input v-model="date" type="date" />
            </div>
            <div>
                <v-btn class="submit-btn" rounded @click="addCharacter()">Submit</v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';

export default {
    name: 'NewEvent',

    components: {},

    data() {
        return {
            imageUrl: '',
            eventName: '',
            date: null,
        };
    },

    created() {},

    methods: {},
};
</script>
<style type="text/css"></style>
