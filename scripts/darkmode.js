function	switch_mode()
{
	const	mode = localStorage.getItem('darkmode') == 'true';
	localStorage.setItem('darkmode', !mode);
	document.documentElement.setAttribute('dark', !mode);
}

function	init_mode()
{
	if (localStorage.getItem('darkmode') == null)
		localStorage.setItem('darkmode', 'false');
	const	mode = localStorage.getItem('darkmode');
	document.documentElement.setAttribute('dark', mode);
}

init_mode();