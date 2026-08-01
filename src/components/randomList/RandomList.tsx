import { useQuery } from '@tanstack/react-query'

type Post = {
    id: number
    title: string
}

const RandomList = () => {
    const getList = async (): Promise<Post[]> => {
        const res = await fetch('https://jsonplaceholder.typicode.com/posts')
        return res.json()
    }

    const { data, isFetching, isPending } = useQuery({
        queryKey: ['myList'],
        initialData: [],
        queryFn: getList,
        
    })

    if (isFetching || isPending) {
        return (
            <div>
                <h2>Загружается</h2>
            </div>
        )
    }

    return (
        <div>
            <ul>
                {data.map(post => (
                    <li key={post.id}>{post.title}</li>
                ))}
            </ul>
        </div>
    )
}

export default RandomList
