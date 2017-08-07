<template>
    <div>
        <h1>{{ msg }}</h1>
        <ol>
            <li v-for="optimization in optimizations">{{ optimization }}</li>
        </ol>
    </div>
</template>

<script>
export default {
    name: 'hello',
    data () {
        return {
            msg: 'vue-cli下webpack有效优化方法:',
            optimizations: ['换用webpack-uglify-parallel并行压缩代码', '使用DllPlugin和DllReferencePlugin预编译']
        }
    }
}
</script>

<style>
li {
    text-align: left;
}
</style>
