export function SuggestUser() {
    const userProfile = [
        {img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', username: "@jenniekim", displayName: 'Jennie Kim'},
        {img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', username: '@rosses', displayName: 'Rose'},
        {img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', username: '@elon Musk', displayName: 'Elon Musk'},
        {img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', username: '@mingyuK_', displayName: 'Mingyu K'},
        {img: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' , username: '@eajP', displayName: 'Eaj Park'},
    ]

    return (
        <div className="rounded-2xl p-4 mt-4 shadow bg-zinc-800">
            <h3 className="font-bold text-white text-lg mb-3">Suggest For You</h3>
            <div className="flex flex-col gap-3">
                {userProfile.map((user) => (
                    <div key={user.username} className="flex justify-between items-center hover:bg-blue-900 p-2 rounded-xl cursor-pointer">
                        <div className="flex items-center gap-2">
                            <img src={user.img} alt={user.username} className="w-8 h-8 rounded-full"/>
                            <div>
                                <p className="font-medium text-blue-600">{user.displayName}</p>
                                <p className="text-sm text-white">{user.username}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}