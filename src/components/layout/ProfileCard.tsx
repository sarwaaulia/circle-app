export function ProfileCard() {
	return (
		<div className="bg-blue-500 rounded-2xl p-4 shadow bg-zinc-800">
			<div className="flex items-center gap-3">
				<img
					src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
					className="w-12 h-12 rounded-full object-cover"
				/>
				<div>
					<h3 className="font-semibold text-blue-600">Stella Fr</h3>
					<p className="text-sm text-white">kinda inactive</p>
				</div>
			</div>
		</div>
	);
}
