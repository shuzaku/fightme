<!-- @format -->
<template>
    <div class="upload-media">
        <div v-show="showProgress">
            <progress-bar :options="options" :value="progress" />
        </div>
        <form>
            <v-file-input
                id="file-input"
                type="file"
                accept="video/mp4"
                placeholder="Upload Video"
                @change="handleFileChange($event)"
            />
        </form>
    </div>
</template>

<script>
import axios from 'axios';
import ProgressBar from 'vuejs-progress-bar';

export default {
    name: 'UploadVideo',
    components: {
        ProgressBar
    },
    data() {
        const progressBarOptions = {
            text: {
                shadowColor: 'black',
                fontSize: 14,
                fontFamily: 'Helvetica',
                dynamicPosition: true
            },
            progress: {
                color: '#E8C401',
                backgroundColor: '#000000'
            },
            layout: {
                height: 35,
                width: 140,
                type: 'line',
                progressPadding: 0,
                verticalTextAlign: 63
            }
        };
        return {
            file: null,
            cloudName: 'shuzchef',
            formData: null,
            errors: [],
            progress: 0,
            showProgress: false,
            fileContents: null,
            preset: 'video_upload',
            options: progressBarOptions,
            results: null
        };
    },
    methods: {
        handleFileChange(event) {
            this.file = event;
        },

        prepareFormData() {
            this.formData = new FormData();
            this.formData.append('upload_preset', this.preset);
            this.formData.append('file', this.fileContents);
        },

        upload() {
            let reader = new FileReader();
            reader.addEventListener(
                'load',
                function() {
                    this.fileContents = reader.result;
                    this.prepareFormData();
                    let cloudinaryUploadURL = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;
                    let requestObj = {
                        url: cloudinaryUploadURL,
                        method: 'POST',
                        data: this.formData,
                        onUploadProgress: function(progressEvent) {
                            this.progress = Math.round(
                                (progressEvent.loaded * 100.0) / progressEvent.total
                            );
                        }.bind(this)
                    };
                    this.showProgress = true;
                    axios(requestObj)
                        .then(response => {
                            this.results = response.data;
                            this.videoUrl = response.data.secure_url;
                            this.$emit('upload:video', this.videoUrl);
                        })
                        .catch(error => {
                            this.errors.push(error);
                        })
                        .finally(() => {
                            setTimeout(
                                function() {
                                    this.showProgress = false;
                                }.bind(this),
                                1000
                            );
                        });
                }.bind(this),
                false
            );
            if (this.file && this.file.name) {
                reader.readAsDataURL(this.file);
            }
        }
    }
};
</script>
<style type="text/css">
.upload-media .submit-btn {
    display: block;
    margin: 0 auto;
}

.upload-media form .v-btn {
    background-color: #1ab097 !important;
}
</style>
