<template>
    <Dialog>
        <DialogTrigger as-child>
            <Button>Add ability</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add ability</DialogTitle>
            </DialogHeader>
            <Separator />
            <DialogDescription class="sr-only">Create a new ability</DialogDescription>

            <p>Select jobs the ability should be added for:</p>
            <div class="grid grid-cols-8 gap-2">
                <Button v-for="job in jobs" :key="job.abbr" @click="toggleSelectedJob(job.abbr)"
                    :variant="selectedJobs.includes(job.abbr) ? 'default' : 'outline'">
                    {{ job.abbr }}
                </Button>
            </div>
            <Separator />

            <Label for="new-ability-title">Title</Label>
            <Input id="new-ability-title" v-model="newTitle" />
            <Label for="new-ability-icon">Icon url</Label>
            <Input id="new-ability-icon" v-model="newIcon" />
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <Label for="new-ability-duration">Duration</Label>
                    <Input type="number" id="new-ability-duration" v-model="newDuration" />
                </div>
                <div>
                    <Label for="new-ability-cooldown">Cooldown</Label>
                    <Input type="number" id="new-ability-cooldown" v-model="newCooldown" />
                </div>
            </div>
            <Label for="new-ability-type">Type</Label>
            <Select id="new-ability-type" v-model="newType">
                <SelectTrigger>
                    <SelectValue placeholder="Select ability type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="mitigation">Mitigation</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                        <SelectItem value="interrupt">Interrupt</SelectItem>
                        <SelectItem value="buff">Buff</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <div v-if="newType === 'mitigation'" class="grid grid-cols-2 gap-2">
                <p class="col-span-2">Set potencies</p>
                <div>
                    <Label for="new-ability-p-physical">Physical</Label>
                    <Input type="number" id="new-ability-p-physical" v-model="newPotency.physical" />
                </div>
                <div>
                    <Label for="new-ability-p-magical">Magical</Label>
                    <Input type="number" id="new-ability-p-magical" v-model="newPotency.magical" />
                </div>
            </div>
            <Separator />
            <DialogFooter>
                <DialogClose as-child>
                    <Button type="button" @click="save">
                        Save
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script lang="ts" setup>
import { JobKey } from '~/injectionkeys'

const emit = defineEmits<{
    (e: 'newAbility', newAbility: JobAbility, targetJobs: JobAbbrevation[]): void
}>()

const newTitle = ref('');
const newIcon = ref('');
const newDuration = ref(0);
const newCooldown = ref(0);
const newType = ref('mitigation' as JobAbilityType);
const newPotency = ref({ physical: 0, magical: 0 })

const selectedJobs = ref([] as JobAbbrevation[]);

const jobs = inject(JobKey, null)

const toggleSelectedJob = (jobAbbr: JobAbbrevation) => {
    if (selectedJobs.value.includes(jobAbbr)) {
        selectedJobs.value = selectedJobs.value.filter(item => item !== jobAbbr)
    } else {
        selectedJobs.value.push(jobAbbr)
    }
}

const save = () => {
    const newAbility = {
        title: newTitle.value,
        icon: newIcon.value,
        cooldown: newCooldown.value,
        duration: newDuration.value,
        type: newType.value
    } as JobAbility;
    if (newType.value === 'mitigation') {
        newAbility.potency = {
            physical: newPotency.value.physical,
            magical: newPotency.value.magical
        }
    }

    emit('newAbility', newAbility, selectedJobs.value);

    // Clear everything
    newTitle.value = '';
    newIcon.value = '';
    newDuration.value = 0;
    newCooldown.value = 0;
    newType.value = 'mitigation' as JobAbilityType;
    newPotency.value = { physical: 0, magical: 0 };
    selectedJobs.value = [] as JobAbbrevation[];
}
</script>