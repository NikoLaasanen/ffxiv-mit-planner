<template>
    <Button @click="toggleColorMode" variant="ghost" class="group">
        <Icon icon="radix-icons:moon"
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Icon icon="radix-icons:sun"
            class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
    </Button>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const colorMode = useColorMode()

const toggleColorMode = () => colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
</script>