// Example usage of the paginated user endpoint

/*
// Request with page and per_page
const response = await trpc.user.getAll.query({
  page: 1,
  per_page: 10,
  search: "john"
});

// Response format:
{
  data: [
    {
      id: "user-1",
      email: "john@example.com",
      fullname: "John Doe",
      age: 30,
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z"
    },
    // ... more users
  ],
  pagination: {
    page: 1,
    per_page: 10,
    total: 156,
    total_pages: 16,
    has_next: true,
    has_prev: false
  }
}

// HTTP request examples:
// GET /trpc/user.getAll?input={"page":1,"per_page":10}
// GET /trpc/user.getAll?input={"page":2,"per_page":25,"search":"john"}

// Usage in frontend:
const [page, setPage] = useState(1);
const [perPage] = useState(10);

const { data, isLoading } = trpc.user.getAll.useQuery({
  page,
  per_page: perPage,
  search: searchTerm
});

const handleNextPage = () => {
  if (data?.pagination.has_next) {
    setPage(page + 1);
  }
};

const handlePrevPage = () => {
  if (data?.pagination.has_prev) {
    setPage(page - 1);
  }
};
*/