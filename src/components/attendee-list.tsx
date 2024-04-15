import { Search, ChevronLeft, ChevronsLeft, MoreHorizontal, ChevronRight, ChevronsRight } from 'lucide-react';
import Table from './table/table';
import { IconButton } from './icon-button';
import { TableHeader } from './table/table-header';
import { TableCell } from './table/table-cell';
import { TableRow } from './table/table-row';
import { ChangeEvent, useEffect, useState } from 'react';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

interface Attendee {
    id: string,
    name: string,
    email: string,
    createdAt: string,
    checkedInAt: string | null
}

export function AttendeeList() {
    // https://youtu.be/O5spa3voojM?t=855
    const [search, setSearch] = useState(() => {
        const url = new URL(window.location.toString());
        
        if(url.searchParams.has('search')) { // se tiver query (search) na url, o state comeca com ele
            return url.searchParams.get('search') ?? '';
        }

        return ""; // senao, o state comeca com string vazia
    });
    const [page, setPage] = useState(() => {
        const url = new URL(window.location.toString());
        
        if(url.searchParams.has('page')) { // se tiver numbero de pagina na url, o state comeca com ele
            return Number(url.searchParams.get('page'));
        }

        return 1; // senao, o state comeca com 1
    });

    const[total, setTotal] = useState(0);
    const [attendees, setAttendees] = useState<Attendee[]>([]);

    useEffect(() => {
        const url = new URL(`http://localhost:3333/events/9e9bd979-9d10-4915-b339-3786b1634f33/attendees`);
        url.searchParams.set('pageIndex', String(page-1));
        
        if(search.length > 0) {
            url.searchParams.set('query', search);
        }

        fetch(url)
            .then((res: Response) => res.json())
            .then(data => {
                setAttendees(data.attendees);
                setTotal(data.total);
            });
    }, [page, search]);

    function setCurrentSearch(search: string) {
        // URL State
        const url = new URL(window.location.toString());
        
        url.searchParams.set('search', search);

        window.history.pushState({}, "", url);

        setSearch(search);
    }

    function setCurrentPage(page: number) {
        // URL State
        const url = new URL(window.location.toString());
        
        url.searchParams.set('page', String(page));

        window.history.pushState({}, "", url);

        setPage(page);
    }

    const totalPages = Math.ceil(total / 10);

    function onSearchInputChanged(e: ChangeEvent<HTMLInputElement>) {
        setCurrentSearch(e.target.value);
        setCurrentPage(1);
    }

    function goToPreviousPage() {
        page == 1 ? setCurrentPage(totalPages) : setCurrentPage(page - 1);
    }

    function goToNextPage() {
        setCurrentPage(page + 1);
    }

    function goToFirstPage() {
        setCurrentPage(1);
    }

    function goToLastPage() {
        setCurrentPage(totalPages);
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className="flex gap-3 items-center">
                <h1 className="text-2xl font-bold">Participantes</h1>
                <div className="px-3 py-1.5 border border-white/10 rounded-lg text-sm w-72 flex items-center gap-3">
                    <Search className='size-4 text-emerald-300' />
                    <input 
                        onChange={e => onSearchInputChanged(e)} 
                        className="bg-transparent flex-1 outline-none border-0 p-0 text-sm ring-0 focus:ring-0" 
                        type="text" 
                        value={search}
                        placeholder="Buscar participante..." />
                </div>
            </div>

            <Table>
                <thead>
                    <tr className='border-b border-white/10'>
                        <TableHeader style={{ width: 48 }}>
                            <input type='checkbox' className='size-4 bg-black/20 rounded border border-white/10 checked:bg-orange-400' />
                        </TableHeader>
                        <TableHeader>Código</TableHeader>
                        <TableHeader>Participante</TableHeader>
                        <TableHeader>Data de inscrição</TableHeader>
                        <TableHeader>Data do check-in</TableHeader>
                        <TableHeader style={{ width: 64 }} ></TableHeader>
                    </tr>
                </thead>
                <tbody>
                    {attendees.map((attendee) => {
                        return (
                            <TableRow key={attendee.id}>
                                <TableCell>
                                    <input type='checkbox' className='size-4 bg-black/20 rounded border border-white/10 accent-orange-400' />
                                </TableCell>
                                <TableCell>{attendee.id}</TableCell>
                                <TableCell>
                                    <div className='flex flex-col gap-1'>
                                        <span className='font-semibold text-white'>{attendee.name}</span>
                                        <span>{attendee.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{dayjs().to(dayjs(attendee.createdAt))}</TableCell>
                                <TableCell>
                                    {attendee.checkedInAt
                                        ? dayjs().to(dayjs(attendee.checkedInAt))
                                        : <span className='text-zinc-400'>Nao fez check-in</span>}
                                </TableCell>
                                <TableCell>
                                    <IconButton transparent>
                                        <MoreHorizontal className='size-4' />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <TableCell colSpan={3} className='py-3 px-2.5 text-sm text-zinc-300'>
                            Mostrando { attendees.length } de {total} itens
                        </TableCell>
                        <TableCell colSpan={3} className='py-3 px-2.5 text-sm text-zinc-300 text-right'>
                            <div className='inline-flex items-center gap-8'>
                                <span>Página {page} de {totalPages}</span>

                                <div className='flex gap-1.5'>
                                    <IconButton onClick={goToFirstPage} disabled={page === 1}>
                                        <ChevronsLeft className='size-4' />
                                    </IconButton>
                                    <IconButton onClick={goToPreviousPage} disabled={page === 1}>
                                        <ChevronLeft className='size-4' />
                                    </IconButton>
                                    <IconButton onClick={goToNextPage} disabled={page === totalPages}>
                                        <ChevronRight className='size-4' />
                                    </IconButton>
                                    <IconButton onClick={goToLastPage} disabled={page === totalPages}>
                                        <ChevronsRight className='size-4' />
                                    </IconButton>
                                </div>
                            </div>
                        </TableCell>
                    </tr>
                </tfoot>
            </Table>

        </div>
    )

}