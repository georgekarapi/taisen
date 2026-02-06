export interface Game {
    title: string;
    slug: string;
    banner: string;
    logo: string;
    sidebarIcon?: string;
}

export const useGames = () => {
    const games = ref<Game[]>([
        {
            title: "Yu-gi-oh!",
            slug: "yu-gi-oh",
            banner: "/images/banners/yugioh.jpg",
            logo: "/images/logos/yugioh.png",
            sidebarIcon: "/images/game-icons/yugioh.png",
        },
        {
            title: "Magic: The Gathering",
            slug: "magic-the-gathering",
            banner: "/images/banners/mtg.jpg",
            logo: "/images/logos/mtg.png",
            sidebarIcon: "/images/game-icons/mtg.png",
        },
        {
            title: "Shadowverse",
            slug: "shadowverse",
            banner: "/images/banners/shadowverse.jpg",
            logo: "/images/logos/shadowverse.png",
            sidebarIcon: "/images/game-icons/shadowverse.png",
        },
        {
            title: "Riftbount",
            slug: "riftbount",
            banner: "/images/banners/riftbount.jpg",
            logo: "/images/logos/riftbount.png",
            sidebarIcon: "/images/game-icons/riftbount.png",
        },
        {
            title: "Parallel",
            slug: "parallel",
            banner: "/images/banners/parallel.jpg",
            logo: "/images/logos/parallel.png",
        }
    ]);

    const getGameBySlug = (slug: string) => {
        return games.value.find((game) => game.slug === slug);
    };

    return {
        games,
        getGameBySlug,
    };
};
