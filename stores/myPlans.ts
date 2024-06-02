import { defineStore } from 'pinia'
import { useToast } from '@/components/ui/toast/use-toast'

export const useMyPlansStore = defineStore('my-plans', {
    state: () => ({
        latest: ref([] as { title: string, id: string }[]),
        favorites: ref([] as { title: string, id: string }[])
    }),
    persist: {
        storage: persistedState.localStorage
    },
    getters: {
        isFavorite: (state) => {
            return (planId: string) => {
                return state.favorites.some((item) => item.id === planId);
            };
        }
    },
    actions: {
        toggleFavorite(planId: string, title: string) {
            const { toast } = useToast()
            if (!this.favorites.some((item) => item.id === planId)) {
                this.favorites.push({ id: planId, title: title });
                toast({ description: 'Added to favorites' });
            } else {
                this.favorites = this.favorites.filter(item => item.id !== planId)
                toast({ description: 'Removed from favorites' });
            }
        }
    }
})