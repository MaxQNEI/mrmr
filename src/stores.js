import { writable, readable } from 'svelte/store';
import { io } from 'socket.io-client';

export const Socket = readable(io());
export const Connected = readable(false, set => {
    Socket.subscribe(Socket => {
        Socket.on('connect', () => {
            console.debug('OnSocketConnect()');
            set(true);
        });
        Socket.on('disconnect', () => {
            console.debug('OnSocketDisconnect()');
            set(false);
        });
    });
});

export const User = {};

export const Title = readable('My Road - My Rules!');
export const ShowSidebar = writable(false);

export const BreadcrumbsItems = writable([]);
