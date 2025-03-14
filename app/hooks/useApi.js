import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export function useApi(url, config = {}) {
  const { data, error, mutate } = useSWR(url, fetcher, {
    ...config
  })

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}