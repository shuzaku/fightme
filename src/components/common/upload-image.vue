<!-- @format -->
<template>
    <div class="upload-image">
        <div v-show="showProgress">
            <progress-bar :options="options" :value="progress" />
        </div>
        <form v-on:submit.prevent="upload">
            <v-file-input
                id="file-input"
                type="file"
                accept="image/*"
                placeholder="Upload image"
                @change="handleFileChange($event)"
            />
            <v-btn class="ma-2" tile color="indigo" dark :disabled="filesSelected">upload</v-btn>
        </form>
    </div>
</template>

<script>
import axios from 'axios';
import ProgressBar from 'vuejs-progress-bar';

export default {
    name: 'NewPost',
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
            filesSelected: null,
            cloudName: 'shuzchef',
            formData: null,
            errors: [],
            progress: 0,
            showProgress: false,
            fileContents: null,
            preset: 'image_upload',
            options: progressBarOptions,
            results: null,
            image: {
                secureUrl: '',
                uploadDate: '',
                id: ''
            }
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
                            this.imageUrl = response.data.secure_url;
                            this.$emit('upload:image', this.imageUrl);
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
.upload-image .submit-btn {
    display: block;
    margin: 0 auto;
}
</style>
