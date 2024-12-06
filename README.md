# ![Blitz CLI Logo](./logo.png)

## **Blitz CLI**: Communicate Seamlessly with [Blitz](https://www.blitz-bots.com)

The Blitz CLI empowers developers to interact with the Blitz ecosystem for creating, managing, and deploying plugins and bots. Built on [Deno](https://deno.com), this CLI ensures a modern, secure, and efficient experience.

> [!NOTE] 
> To use the Blitz CLI, we recommend installing [Deno](https://deno.com) first.

---

## **Install CLI Globally
```bash
deno install --global --allow-run -N -R -W -E -n blitz jsr:@blitz-bots/cli
```

## **Commands**

### **Account-Required Commands**
These commands require you to be authenticated with your Blitz account:

- **`publish`**: Publish a new or updated plugin to the Blitz platform.
- **`delete`**: Delete an existing plugin from the Blitz platform.

### **Non-Account-Required Commands**
These commands do not require an account:

- **`auth`**: Authenticate your Blitz account.
- **`install`**: Install plugins from the Blitz repository.
- **`plugin`**: Generate the boilerplate for a new plugin.
- **`bot`**: Generate the boilerplate for a new bot.

---

## **Usage Examples**

### **Install a Plugin** (No Account Required)
To install a plugin:  
```bash
blitz install my_plugin
```

To install a specific version of a plugin:  
```bash
blitz install my_plugin@1.2.3
```

### **Publish a Plugin** (Account Required)
To publish a plugin:  
```bash
blitz publish
```

### **Delete a Plugin** (Account Required)
To delete a plugin:  
```bash
blitz delete my_plugin
```

### **Generate a Plugin** (No Account Required)
To create a new plugin scaffold:  
```bash
blitz plugin
```

### **Generate a Bot** (No Account Required)
To create a new bot scaffold:  
```bash
blitz bot
```

---

## **Getting Started**

1. **Install Deno**  
   Follow the instructions on the [Deno installation page](https://deno.land/manual@v1.34.0/getting_started/installation).

2. **Run Blitz CLI Commands**  
   Use the examples provided above to install plugins, publish, delete, and generate new bots or plugins.

3. **Explore More**  
   Visit [Blitz Bots](https://www.blitz-bots.com/) for documentation, examples, and support.

---

## **Why Blitz CLI?**

- **Efficient Development**: Quickly scaffold and manage plugins or bots.
- **Deno-powered**: Secure and fast runtime with a built-in package manager.
- **Community-driven**: Share and install plugins effortlessly.

Get started with Blitz CLI and transform your bot-building experience! 🚀
