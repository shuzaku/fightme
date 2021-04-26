<!-- @format -->
<template>
    <div class="login-modal">
        <div class="card">
            <div class="card-header">Login</div>
            <div class="card-body">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
                <form action="#" @submit.prevent="submit">
                    <div class="form-group row">
                        <label for="email" class="col-md-4 col-form-label text-md-right"
                            >Email</label
                        >
                        <div class="col-md-6">
                            <input
                                id="email"
                                v-model="form.email"
                                type="email"
                                class="form-control"
                                name="email"
                                value
                                required
                                autofocus
                            />
                        </div>
                    </div>

                    <div class="form-group row">
                        <label for="password" class="col-md-4 col-form-label text-md-right"
                            >Password</label
                        >
                        <div class="col-md-6">
                            <input
                                id="password"
                                v-model="form.password"
                                type="password"
                                class="form-control"
                                name="password"
                                required
                            />
                        </div>
                    </div>

                    <div class="form-group row mb-0">
                        <div class="col-md-8 offset-md-4">
                            <button type="submit" class="btn btn-primary">Login</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase';

export default {
    data() {
        return {
            user: null,
            form: {
                email: '',
                password: ''
            },
            error: null
        };
    },
    methods: {
        submit() {
            firebase
                .auth()
                .signInWithEmailAndPassword(this.form.email, this.form.password)
                .then(data => {
                    this.user = {
                        id: data.user.uid
                    };
                    this.$emit('login:success');
                })
                .catch(err => {
                    this.error = err.message;
                });
        }
    }
};
</script>

<style>
.login-modal {
    background: #fff;
    position: absolute;
    top: 50px;
    left: 50%;
    max-width: 300px;
    width: 100%;
    border-radius: 30px;
}

.login-modal .card {
    max-width: 200px;
    margin: 0 auto;
}

.login-modal .form-group.row {
    display: block;
    text-align: left;
}

.login-modal input {
    border: 1px solid #000;
    color: #000;
}

.login-modal label {
    color: #000;
}

.login-modal .btn {
    background: #1ab097;
    color: #fff;
    padding: 5px 20px;
}
</style>
