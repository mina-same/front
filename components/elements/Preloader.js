import Image from "next/image"

const Preloader = () => {
	return (
		<>
			<div id="preloader-active" className="flex items-center justify-center min-h-screen">
				<div className="preloader flex flex-col items-center justify-center">
					<div className="logo jump">
						<Image
							width="0"
							height="0"
							sizes="100vw"
							style={{ width: "auto", height: "auto" }} 
							src="/assets/imgs/logos/taiarLogo.png" 
							alt="Monst" 
						/>
					</div>
				</div>
			</div>
		</>
	)
}

export default Preloader
