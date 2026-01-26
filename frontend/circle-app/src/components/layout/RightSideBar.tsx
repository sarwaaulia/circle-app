import { DevelopedBy } from "./MiniCard";
import { ProfileCard } from "./ProfileCard";
import { SuggestUser } from "./SuggestUser";

export default function RightSidebar() {
    return (
        <aside className="h-screen w-80 bg-zinc-900 p-6 flex flex-col gap-6 fixed right-0 top-0 overflow-y-auto">
            <ProfileCard/>
            <SuggestUser/>
            <DevelopedBy/>
        </aside>
    )
}