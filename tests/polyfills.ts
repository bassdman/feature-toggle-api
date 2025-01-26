const window = {
    isMocked: true,
    decodeURIComponent:function(param1){
        return param1;
    }
}

function useWindowMock(){
    return {
        isMocked: true,
        decodeURIComponent:function(param1){
            return param1;
        }
    }
}

export {
    window,
    useWindowMock
}