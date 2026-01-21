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
                <div class="grid grid-cols-[2fr,1fr] gap-2">
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-autos" class="self-center font-normal">Show auto attacks</Label>
                        <Checkbox id="preferences-show-autos" :checked="showAutoAttacks"
                            @click="showAutoAttacks = !showAutoAttacks" />
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-median-dmg" class="self-center font-normal">Show median
                            damage</Label>
                        <Checkbox id="preferences-show-median-dmg" :checked="showMedianDamage"
                            @click="showMedianDamage = !showMedianDamage" />
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-activation-buffer" class="font-normal">Activation buffer</Label>
                        <span class="flex gap-1">
                            <Input id="preferences-activation-buffer" type="number" v-model="activationBuffer" />
                            <span class="grid place-content-center">s</span>
                        </span>
                    </div>

                    <div class="col-span-3 flex flex-col gap-2">
                        <Separator />
                        <p class="text-xs font-medium text-muted-foreground">Show abilities by target:</p>
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-autos" class="self-center font-normal">Party</Label>
                        <Checkbox id="preferences-show-autos" :checked="showParty" @click="showParty = !showParty" />
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-autos" class="self-center font-normal">Single target</Label>
                        <Checkbox id="preferences-show-autos" :checked="showSingle" @click="showSingle = !showSingle" />
                    </div>

                    <div class="col-span-3 flex flex-col gap-2">
                        <Separator />
                        <p class="text-xs font-medium text-muted-foreground">Show ability type on timeline:</p>
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-autos" class="self-center font-normal">Mitigation</Label>
                        <Checkbox id="preferences-show-autos" :checked="showAbilityTypeMitigation"
                            @click="showAbilityTypeMitigation = !showAbilityTypeMitigation" />
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-autos" class="self-center font-normal">Utility</Label>
                        <Checkbox id="preferences-show-autos" :checked="showAbilityTypeUtility"
                            @click="showAbilityTypeUtility = !showAbilityTypeUtility" />
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-autos" class="self-center font-normal">Interrupt</Label>
                        <Checkbox id="preferences-show-autos" :checked="showAbilityTypeInterrupt"
                            @click="showAbilityTypeInterrupt = !showAbilityTypeInterrupt" />
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-autos" class="self-center font-normal">Buffs</Label>
                        <Checkbox id="preferences-show-autos" :checked="showAbilityTypeBuff"
                            @click="showAbilityTypeBuff = !showAbilityTypeBuff" />
                    </div>

                    <div class="col-span-3 flex flex-col gap-2">
                        <Separator />
                        <p class="text-xs font-medium text-muted-foreground">Set columns on timeline:</p>
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-col-source" class="self-center font-normal">Source</Label>
                        <Checkbox id="preferences-show-col-source" :checked="showColSource"
                            @click="showColSource = !showColSource" />
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-col-source-count" class="self-center font-normal">Source
                            count</Label>
                        <Checkbox id="preferences-show-col-source-count" :checked="showColSourceCount"
                            @click="showColSourceCount = !showColSourceCount" />
                    </div>
                    <div class="grid grid-cols-subgrid col-span-2 items-center">
                        <Label for="preferences-show-col-source-count" class="self-center font-normal">Mistakes</Label>
                        <Checkbox id="preferences-show-col-source-count" :checked="showColMistakes"
                            @click="showColMistakes = !showColMistakes" />
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
const {
    showAutoAttacks,
    showMedianDamage,
    activationBuffer,
    showParty,
    showSingle,
    showAbilityTypeMitigation,
    showAbilityTypeUtility,
    showAbilityTypeInterrupt,
    showAbilityTypeBuff,
    showColSource,
    showColSourceCount,
    showColMistakes
} = storeToRefs(preferencesStore);
</script>