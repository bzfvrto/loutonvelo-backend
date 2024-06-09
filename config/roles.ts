{
    roles: [
        {
            name: "admin",
            permissions: [
                "*",
            ],
        },
        {
            name: "resseller",
            permissions: [
                "create_bike",
                "show_booking",
            ],
        },
        {
            name: "user",
            permissions: [
                "create_booking",
            ],
        },
    ]
}
