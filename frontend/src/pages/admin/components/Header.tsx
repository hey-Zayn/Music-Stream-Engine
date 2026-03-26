import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
	return (
		<div className='flex flex-col sm:flex-row items-center justify-between gap-4 mb-8'>
			<div className='flex items-center gap-3'>
				<Link to='/' className='rounded-lg'>
					<img src='/spotify.png' className='size-10 text-black' />
				</Link>
				<div>
					<h1 className='text-3xl font-bold'>Music Manager</h1>
					<p className='text-zinc-400 mt-1 text-center sm:text-left'>Manage your music catalog</p>
				</div>
			</div>
			<UserButton />
		</div>
	);
};
export default Header;