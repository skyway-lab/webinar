function changeAudioOut(audioOutId) {
    function attachSinkId(element) {
        if (typeof element.audioOutId !== 'undefined') {
            element.setSinkId(audioOutId)
                .then(function() {
                    console.log('Success, audio output device attached: ' + audioOutId);
                })
                .catch(function(error) {
                    console.error(error);
                });
        } else {
            console.warn('Browser does not support output device selection.');
        }
    }

    Array.proptype.forEach.apply(document.querySelectorAll('video'), attachSinkId);
}

export default changeAudioOut();