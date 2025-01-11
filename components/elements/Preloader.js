import Image from "next/image"

const Preloader = () => {
	return (
		<>
			<div id="preloader-active">
				<div className="preloader flex-1 content-center">
					<div className="logo absolute inset-y-2/4 jump">
						<Image
							width="0"
							height="0"
							sizes="100vw"
							style={{ width: "auto", height: "auto" }} src="/assets/imgs/logos/favicon.svg" alt="Monst" />
						<h1 className="text-lg font-semibold">Monst</h1>
					</div>
				</div>
			</div>
		</>
	)
}

export default Preloader