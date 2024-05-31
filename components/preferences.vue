<template>
    <Popover>
        <PopoverTrigger as-child>
            <Button variant="ghost" class="group">
                <Icon icon="radix-icons:gear" class="h-[1.2rem] w-[1.2rem] transition-all group-hover:rotate-45" />
                <span class="sr-only">Preferences</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-80">
            <div class="grid gap-4">
                <div class="space-y-2">
                    <h4 class="font-medium leading-none">
                        Preferences
                    </h4>
                </div>
                <Separator />
                <div class="grid grid-cols-2 gap-2">
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-autos" class="self-center font-normal">Show auto attacks</Label>
                        <Checkbox id="preferences-show-autos" :checked="showAutoAttacks"
                            @click="showAutoAttacks = !showAutoAttacks" />
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-activation-buffer" class="font-normal">Activation buffer</Label>
                        <span class="flex gap-1">
                            <Input id="preferences-activation-buffer" type="number" v-model="activationBuffer" />
                            <span class="grid place-content-center">s</span>
                        </span>
                    </div>
                </div>
            </div>
        </PopoverContent>
    </Popover>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { Icon } from '@iconify/vue'

const preferencesStore = usePreferencesStore();
const { showAutoAttacks, activationBuffer } = storeToRefs(preferencesStore);
</script>