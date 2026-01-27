import { DevelopedBy } from "./MiniCard";
import { ProfileCard } from "./MyProfile";
import { SuggestUsers } from "./SuggestUser";

export default function RightSidebar() {
    return (
        <aside className="bg-zinc-900 p-6 flex flex-col gap-6 fixed right-0 top-0 overflow-y-auto">
            <ProfileCard/>
            <SuggestUsers/>
            <DevelopedBy/>
        </aside>
    )
}