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

                <input
                    id="redirect-url"
                    v-model="redirectUrl"
                    type="text"
                    placeholder="Redirect Url"
                />

                <multiselect
                    v-model="selectedType"
                    :options="types"
                    :close-on-select="true"
                    :clear-on-select="false"
                    :preserve-search="true"
                    placeholder="Select Type"
                    @input="setType"
                >
                    <template slot="selection" slot-scope="{ values, isOpen }">
                        <span v-if="values.length &amp;&amp; !isOpen" class="multiselect__single">
                            Select Type
                        </span>
                    </template>
                </multiselect>
                <input v-model="date" type="date" />
            </div>
            <div>
                <v-btn class="submit-btn" rounded @click="addEvent()">Submit</v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import { eventbus } from '@/main';
import moment from 'moment';
import EventsService from '@/services/events-service';

export default {
    name: 'NewEvent',

    components: {},

    data() {
        return {
            imageUrl: '',
            eventName: '',
            date: null,
            types: ['Tournament', 'Game', 'Character', 'Patch'],
            selectedType: null,
            redirectUrl: null,
        };
    },

    created() {},

    methods: {
        setType(item) {
            this.selectedType = item;
        },

        async addEvent() {
            await EventsService.addEvent({
                Name: this.eventName,
                ImageUrl: this.imageUrl,
                Date: moment(this.date),
                Type: this.selectedType,
                Url: this.redirectUrl,
            });

            this.$emit('closeModal');
        },
    },
};
</script>
<style type="text/css">
.multiselect {
    margin-bottom: 20px;
}
</style>
